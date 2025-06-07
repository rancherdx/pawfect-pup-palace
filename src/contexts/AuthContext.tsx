
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/api'; // Assuming auth API functions return roles as string[]

interface User {
  id: string; // Changed from number
  name: string;
  email: string;
  roles: string[];      // Changed from role: string
  primaryRole: string;  // Stores the determined primary role for quick access
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>; // Return type updated
  register: (userData: { email: string, password: string, name: string }) => Promise<User>; // Return type updated
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const determinePrimaryRole = (roles: string[] | undefined | null): string => {
  if (roles && Array.isArray(roles)) {
    if (roles.includes('super-admin')) return 'super-admin';
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('editor')) return 'editor';
    if (roles.length > 0) return roles[0];
  }
  return 'user'; // Default if no roles or invalid
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const apiUser = await auth.getCurrentUser(); // Assuming this returns roles as string[]
        if (apiUser) {
          setUser({
            ...apiUser,
            id: String(apiUser.id), // Ensure id is string
            roles: apiUser.roles || ['user'],
            primaryRole: determinePrimaryRole(apiUser.roles),
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        setUser(null); // Ensure user is null on error
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const apiUser = await auth.login(email, password); // Assuming this returns roles as string[]
      const transformedUser = {
        ...apiUser,
        id: String(apiUser.id),
        roles: apiUser.roles || ['user'],
        primaryRole: determinePrimaryRole(apiUser.roles),
      };
      setUser(transformedUser);
      return transformedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { email: string, password: string, name: string }) => {
    setIsLoading(true);
    try {
      const apiUser = await auth.register(userData); // Assuming this returns roles as string[]
      const transformedUser = {
        ...apiUser,
        id: String(apiUser.id),
        roles: apiUser.roles || ['user'],
        primaryRole: determinePrimaryRole(apiUser.roles),
      };
      setUser(transformedUser);
      return transformedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await auth.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
