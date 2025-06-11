
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api/client';
import { User, AuthResponse, UserRegistrationData, UserLoginData } from '@/types';

// Local User interface is removed. Imported User will be used.

interface AuthContextType {
  user: User | null; // Uses imported User
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: UserLoginData) => Promise<void>; // Updated
  register: (registrationData: UserRegistrationData) => Promise<void>; // Updated
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void; // Uses imported User
  setNewTokens: (newAccessToken: string, newRefreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null); // New state for refresh token
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      let currentToken = localStorage.getItem('jwtToken');
      let currentRefreshToken = localStorage.getItem('jwtRefreshToken');

      if (currentToken) {
        setToken(currentToken); // Set initial token for getAuthHeaders
        if (currentRefreshToken) {
          setRefreshToken(currentRefreshToken);
        }

        try {
          console.log('Attempting to fetch profile with stored token.');
          const userProfile = await authApi.getProfile(); // authApi.getProfile uses getAuthHeaders which reads currentToken from localStorage
          setUser(userProfile);
        } catch (initialError) {
          console.error('Initial profile fetch failed:', initialError);
          // Check if it was a 401 type error (though error structure from apiRequest might just be Error object)
          // and if a refresh token exists
          if (currentRefreshToken) { // Check currentRefreshToken from closure, not a new localStorage.getItem call
            console.log('Attempting token refresh during init due to profile fetch failure.');
            try {
              const refreshResponse = await authApi.refreshToken(currentRefreshToken);

              currentToken = refreshResponse.token; // Update currentToken for retry
              localStorage.setItem('jwtToken', currentToken);
              setToken(currentToken);

              if (refreshResponse.refreshToken) {
                currentRefreshToken = refreshResponse.refreshToken;
                localStorage.setItem('jwtRefreshToken', currentRefreshToken);
                setRefreshToken(currentRefreshToken);
              }

              console.log('Token refreshed during init. Retrying profile fetch.');
              // Retry getProfile with the new token (getAuthHeaders will pick it up)
              const userProfileAfterRefresh = await authApi.getProfile();
              setUser(userProfileAfterRefresh);
              console.log('Profile fetched successfully after refresh.');

            } catch (refreshError) {
              console.error('Token refresh attempt during init also failed:', refreshError);
              // If refresh fails, clear all tokens and user
              localStorage.removeItem('jwtToken');
              localStorage.removeItem('jwtRefreshToken');
              setToken(null);
              setRefreshToken(null);
              setUser(null);
            }
          } else {
            // No refresh token to attempt with, so clear tokens as before
            console.log('No refresh token available during init profile fetch failure.');
            localStorage.removeItem('jwtToken');
            // No need to remove jwtRefreshToken again if it was null
            setToken(null);
            // setRefreshToken(null); // Already null if currentRefreshToken was null
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array means this runs once on mount

  const login = async (credentials: UserLoginData) => {
    try {
      const response: AuthResponse = await authApi.login(credentials);
      const { token: newAccessToken, user: userData, refreshToken: newRefreshToken } = response;
      
      localStorage.setItem('jwtToken', newAccessToken);
      setToken(newAccessToken);
      setUser(userData);

      if (newRefreshToken) {
        localStorage.setItem('jwtRefreshToken', newRefreshToken);
        setRefreshToken(newRefreshToken);
      } else {
        // Clear any old refresh token if login doesn't provide a new one
        localStorage.removeItem('jwtRefreshToken');
        setRefreshToken(null);
      }
    } catch (error) {
      // Clear tokens on login failure to be safe
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtRefreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      throw error;
    }
  };

  const register = async (registrationData: UserRegistrationData) => {
    try {
      const response: AuthResponse = await authApi.register(registrationData);
      const { token: newAccessToken, user: newUser, refreshToken: newRefreshToken } = response;
      
      localStorage.setItem('jwtToken', newAccessToken);
      setToken(newAccessToken);
      setUser(newUser);

      if (newRefreshToken) {
        localStorage.setItem('jwtRefreshToken', newRefreshToken);
        setRefreshToken(newRefreshToken);
      } else {
        localStorage.removeItem('jwtRefreshToken');
        setRefreshToken(null);
      }
    } catch (error) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtRefreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Optional: Call API endpoint to invalidate refresh token on server-side if it exists
      // if (refreshToken) await authApi.logoutServerSide(refreshToken);
      await authApi.logout(); // This likely just invalidates the access token server-side
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtRefreshToken'); // Remove refresh token
      setToken(null);
      setRefreshToken(null); // Clear refresh token state
      setUser(null);
    }
  };

  const setNewTokens = (newAccessToken: string, newRefreshTokenValue?: string) => {
    localStorage.setItem('jwtToken', newAccessToken);
    setToken(newAccessToken);

    if (newRefreshTokenValue) {
      localStorage.setItem('jwtRefreshToken', newRefreshTokenValue);
      setRefreshToken(newRefreshTokenValue);
    }
    // If newRefreshTokenValue is undefined, it means the refresh token was not rotated,
    // so we keep the existing one in state and localStorage.
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    refreshToken, // Add refreshToken
    isAuthenticated: !!user && !!token, // isAuthenticated logic remains based on access token
    isLoading,
    login,
    register,
    logout,
    updateUser,
    setNewTokens, // Add setNewTokens
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
