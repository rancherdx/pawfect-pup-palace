
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthResponse, UserRegistrationData, UserLoginData } from '@/types';

/**
 * @interface AuthContextType
 * @description Defines the shape of the authentication context, including user data, auth status, and functions.
 */
interface AuthContextType {
  user: User | null; // Uses imported User
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authStatus: 'idle' | 'loading' | 'loaded' | 'error' | 'timeout'; // New auth status
  login: (credentials: UserLoginData) => Promise<void>; // Updated
  register: (registrationData: UserRegistrationData) => Promise<void>; // Updated
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void; // Uses imported User
  setNewTokens: (newAccessToken: string, newRefreshToken?: string) => void;
  getDefaultRoute: () => string; // Helper to get appropriate dashboard route
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @hook useAuth
 * @description A custom hook to access the authentication context.
 * @throws Will throw an error if used outside of an `AuthProvider`.
 * @returns {AuthContextType} The authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * @component AuthProvider
 * @description Provides authentication state and functions to its children components.
 * It manages the user's session, profile data, and authentication status.
 * @param {{ children: React.ReactNode }} props - The props for the component.
 * @returns {React.ReactElement} The rendered provider component.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'idle' | 'loading' | 'loaded' | 'error' | 'timeout'>('idle');
  const authTimeoutRef = React.useRef<NodeJS.Timeout>();

  /**
   * Fetches a user's profile and roles from the database.
   * @param {string} userId - The ID of the user to fetch data for.
   * @returns {Promise<{ profile: any; roles: string[] }>} An object containing the user's profile and roles.
   */
  const fetchUserProfile = async (userId: string) => {
    try {
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('name').eq('id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId)
      ]);

      if (process.env.NODE_ENV === 'development') {
        if (profileRes.error) console.error('[DEV] Error fetching profile:', profileRes.error);
        if (rolesRes.error) console.error('[DEV] Error fetching roles:', rolesRes.error);
      }

      const roles = rolesRes.data ? rolesRes.data.map(ur => ur.role) : [];
      
      return { profile: profileRes.data, roles };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[DEV] Error fetching user profile:', error);
      }
      return { profile: null, roles: [] };
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Set safety timeout (10 seconds)
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[DEV] Auth initialization timed out');
        }
        setAuthStatus('timeout');
        setIsLoading(false);
      }
    }, 10000);

    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          const { profile, roles } = await fetchUserProfile(session.user.id);
          
          if (!isMounted) return;
          
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || '',
            roles,
            createdAt: session.user.created_at
          });
          setToken(session.access_token);
          setRefreshToken(session.refresh_token);
        }
        
        if (isMounted) {
          setAuthStatus('loaded');
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        if (isMounted) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[DEV] Error loading session:', error);
          }
          setAuthStatus('error');
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    setIsLoading(true);
    setAuthStatus('loading');
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          setIsLoading(true);
          setAuthStatus('loading');
        }

        if (session?.user) {
          const { profile, roles } = await fetchUserProfile(session.user.id);
          
          if (!isMounted) return;
          
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || '',
            roles,
            createdAt: session.user.created_at
          });
          setToken(session.access_token);
          setRefreshToken(session.refresh_token);
        } else {
          setUser(null);
          setToken(null);
          setRefreshToken(null);
        }
        
        if (isMounted) {
          setAuthStatus('loaded');
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  /**
   * Logs in a user with email and password.
   * @param {UserLoginData} credentials - The user's login credentials.
   * @returns {Promise<void>}
   */
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

  /**
   * Registers a new user.
   * @param {UserRegistrationData} registrationData - The data for the new user.
   * @returns {Promise<void>}
   */
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

  /**
   * Logs out the current user.
   * @returns {Promise<void>}
   */
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

  /**
   * Sets new authentication tokens in the state.
   * @param {string} newAccessToken - The new access token.
   * @param {string} [newRefreshToken] - The new refresh token, if available.
   */
  const setNewTokens = (newAccessToken: string, newRefreshTokenValue?: string) => {
    setToken(newAccessToken);
    if (newRefreshTokenValue) {
      setRefreshToken(newRefreshTokenValue);
    }
  };

  /**
   * Updates the user data in the context state.
   * @param {Partial<User>} userData - The partial user data to update.
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  /**
   * Determines the default route for a user based on their roles.
   * @returns {string} The default route path.
   */
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
    refreshToken,
    isAuthenticated: !!user && !!token,
    isLoading,
    authStatus,
    login,
    register,
    logout,
    updateUser,
    setNewTokens,
    getDefaultRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
