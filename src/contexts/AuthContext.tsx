
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      
      try {
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setToken(null);
          setRefreshToken(null);
        } else if (session) {
          // Set tokens from Supabase session
          setToken(session.access_token);
          setRefreshToken(session.refresh_token);
          
          // Note: Profiles table will be available after migration
          
          // Create user object combining auth and profile data
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || '',
            roles: [session.user.user_metadata?.role || 'customer'],
            createdAt: session.user.created_at
          };
          
          setUser(userData);
        } else {
          setUser(null);
          setToken(null);
          setRefreshToken(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setToken(session.access_token);
          setRefreshToken(session.refresh_token);
          
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || '',
            roles: [session.user.user_metadata?.role || 'customer'],
            createdAt: session.user.created_at
          };
          
          setUser(userData);
        } else {
          setUser(null);
          setToken(null);
          setRefreshToken(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: UserLoginData) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        setToken(data.session.access_token);
        setRefreshToken(data.session.refresh_token);

        const userData: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || '',
          roles: [data.user.user_metadata?.role || 'customer'],
          createdAt: data.user.created_at
        };

        setUser(userData);
      }
    } catch (error) {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      throw error;
    }
  };

  const register = async (registrationData: UserRegistrationData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          data: {
            name: registrationData.name,
            role: 'customer'
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        setToken(data.session.access_token);
        setRefreshToken(data.session.refresh_token);

        const userData: User = {
          id: data.user!.id,
          email: data.user!.email!,
          name: registrationData.name,
          roles: ['customer'],
          createdAt: data.user!.created_at
        };

        setUser(userData);
      }
    } catch (error) {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const setNewTokens = (newAccessToken: string, newRefreshTokenValue?: string) => {
    setToken(newAccessToken);
    if (newRefreshTokenValue) {
      setRefreshToken(newRefreshTokenValue);
    }
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
