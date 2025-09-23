/**
 * Encrypts a JSON object using AES-GCM.
 * The key must be a 32-byte value, base64-encoded.
 * The output format is "iv:ciphertext", where both are base64-encoded.
 *
 * @param json The JSON object to encrypt.
 * @param base64Key The base64-encoded 32-byte encryption key.
 * @returns A promise that resolves to the encrypted string.
 */
export async function encryptJson(json: unknown, base64Key: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(json));
  const keyBytes = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  if (keyBytes.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes (base64-encoded)");
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `${ivB64}:${ctB64}`;
}

/**
 * Decrypts a string that was encrypted with `encryptJson`.
 *
 * @param encrypted The encrypted string in "iv:ciphertext" format.
 * @param base64Key The base64-encoded 32-byte encryption key.
 * @returns A promise that resolves to the decrypted JSON object.
 */
export async function decryptJson(encrypted: string, base64Key: string): Promise<any> {
  const dec = new TextDecoder();
  const [ivB64, ctB64] = encrypted.split(":");
  if (!ivB64 || !ctB64) {
    throw new Error("Invalid encrypted data format.");
  }
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
  const keyBytes = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  if (keyBytes.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes (base64-encoded)");
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return JSON.parse(dec.decode(decrypted));
}
