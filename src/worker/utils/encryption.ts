import type { Env } from '../env';

// Helper to convert Hex string to ArrayBuffer
function hexToBuffer(hex: string): ArrayBuffer {
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters.");
  }
  const buffer = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    buffer[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return buffer.buffer;
}

// Helper to convert ArrayBuffer to Base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(env: Env): Promise<CryptoKey | null> {
  if (!env.ENCRYPTION_KEY_SECRET) {
    console.error("CRITICAL: ENCRYPTION_KEY_SECRET is not defined in environment variables.");
    return null;
  }
  if (env.ENCRYPTION_KEY_SECRET.length !== 64) {
    console.error("CRITICAL: ENCRYPTION_KEY_SECRET must be a 64-character hex string (32 bytes for AES-256).");
    return null;
  }
  try {
    const keyBuffer = hexToBuffer(env.ENCRYPTION_KEY_SECRET);
    return await crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false, // not extractable
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Failed to import encryption key:", error);
    return null;
  }
}

export async function encryptApiKey(
  apiKey: string,
  env: Env
): Promise<{ encryptedKey: string; iv: string } | null> {
  try {
    const cryptoKey = await getCryptoKey(env);
    if (!cryptoKey) return null;

    const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM recommended IV size is 12 bytes
    const encodedApiKey = new TextEncoder().encode(apiKey);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      encodedApiKey
    );

    return {
      encryptedKey: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv),
    };
  } catch (error) {
    console.error("Error encrypting API key:", error);
    return null;
  }
}

export async function decryptApiKey(
  storedApiKeyWithValue: string, // Format: "iv_base64:encrypted_key_base64"
  env: Env
): Promise<string | null> {
  try {
    const cryptoKey = await getCryptoKey(env);
    if (!cryptoKey) return null;

    const parts = storedApiKeyWithValue.split(':');
    if (parts.length !== 2) {
      console.error("Invalid stored API key format. Expected 'iv:encryptedKey'.");
      return null;
    }
    const ivB64 = parts[0];
    const encryptedKeyB64 = parts[1];

    const iv = base64ToUint8Array(ivB64);
    const encryptedKeyBuffer = base64ToUint8Array(encryptedKeyB64);

    // Ensure IV length is 12 bytes for AES-GCM common use case
    if (iv.byteLength !== 12) {
        console.error("Decryption error: IV length is not 12 bytes. Actual length:", iv.byteLength);
        // This might indicate a problem with how IV was generated or stored.
        // Or if a different algorithm/parameter set was used during encryption.
        // For AES-GCM, a 12-byte IV is standard and recommended.
        // Depending on the crypto.subtle.encrypt implementation details, other lengths might be permissible
        // but it's good to be strict here if 12 bytes is the expectation.
    }

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      cryptoKey,
      encryptedKeyBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error("Error decrypting API key:", error);
    // Common errors:
    // - Malformed key or IV (e.g., incorrect base64 decoding)
    // - Incorrect encryption key (ENCRYPTION_KEY_SECRET mismatch)
    // - IV mismatch (if a different IV was used for encryption than provided for decryption)
    // - Ciphertext tampered (GCM includes an authentication tag, decryption fails if data changed)
    // - OperationError if the tag authentication fails
    return null;
  }
}
