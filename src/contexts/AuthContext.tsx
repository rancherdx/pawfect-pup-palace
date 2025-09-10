
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
  getDefaultRoute: () => string; // Helper to get appropriate dashboard route
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

  // Fetch user profile and roles from database
  const fetchUserProfile = async (userId: string) => {
    try {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId)
      ]);

      if (profileRes.error) console.error('Error fetching profile:', profileRes.error);
      if (rolesRes.error) console.error('Error fetching roles:', rolesRes.error);

      const roles = rolesRes.data ? rolesRes.data.map(ur => ur.role) : [];
      
      return { profile: profileRes.data, roles };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { profile: null, roles: [] };
    }
  };

  useEffect(() => {
    const handleAuthStateChange = async (session: any) => {
      if (session?.user) {
        try {
          const { profile, roles } = await fetchUserProfile(session.user.id);

          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || '',
            roles,
            createdAt: session.user.created_at
          });

          setToken(session.access_token);
          setRefreshToken(session.refresh_token);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUser(null);
          setToken(null);
          setRefreshToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
        setRefreshToken(null);
      }
      setIsLoading(false);
    };

    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only set loading true for sign-in/sign-out events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          setIsLoading(true);
        }
        await handleAuthStateChange(session);
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

      // The onAuthStateChange listener will handle setting user state with profile data
    } catch (error) {
      throw error;
    }
  };

  const register = async (registrationData: UserRegistrationData) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: registrationData.name
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Note: User profile and roles will be created automatically by the trigger
      // The onAuthStateChange listener will handle updating the user state
    } catch (error) {
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

  const getDefaultRoute = () => {
    if (!user) return '/';
    
    const userRoles = user.roles || [];
    // Super-admins and admins go to admin dashboard
    if (userRoles.includes('super-admin') || userRoles.includes('admin')) {
      return '/admin';
    }
    // Regular users go to user dashboard
    return '/dashboard';
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
    getDefaultRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
