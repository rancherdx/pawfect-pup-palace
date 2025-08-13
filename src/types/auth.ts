// src/types/auth.ts

/**
 * Represents the structure of a user object.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[]; // e.g., ['user', 'admin']
  createdAt?: string;
}

/**
 * Data structure for user registration requests.
 */
export interface UserRegistrationData {
  name: string;
  email: string;
  password: string;
  // confirmPassword?: string; // If applicable
}

/**
 * Data structure for user login requests.
 */
export interface UserLoginData {
  email: string;
  password: string;
}

/**
 * Response structure for successful login or registration.
 */
export interface AuthResponse {
  token: string;        // Access token
  refreshToken?: string; // Optional: If refresh tokens are rotated
  user: User;           // The authenticated user object
}

/**
 * Response structure for token refresh operation.
 */
export interface RefreshTokenResponse {
  token: string;        // New access token
  refreshToken?: string; // Optional: New refresh token if rotated
}

/**
 * Data structure for updating a user's profile.
 * Typically a subset of the User interface, allowing partial updates.
 */
export type UserProfileUpdateData = Partial<Omit<User, 'id' | 'email' | 'roles' | 'createdAt' | 'lastLogin'>>;
// Example: Allowing name and avatarUrl to be updated.
// Adjust Omit<> and add specific fields as needed based on what profile aspects are updatable.
// For instance, if only 'name' and 'avatarUrl' are updatable:
// export interface UserProfileUpdateData {
//   name?: string;
//   avatarUrl?: string;
//   preferences?: Record<string, any>;
// }


// If profile update returns the full user object:
// The response type for updateProfile would be Promise<User>
