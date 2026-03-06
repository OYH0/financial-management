
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInProgress, setRefreshInProgress] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Set initial throttle time between refreshes (in milliseconds)
    const refreshThrottleTime = 5000; // 5 seconds minimum between refreshes
    let lastRefreshTime = 0;
    
    // Set up auth state listener with throttling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        


        // Only update state, don't do additional operations for most events
        if (event !== 'TOKEN_REFRESHED' && event !== 'SIGNED_OUT') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          return;
        }
        
        // For token refreshes, implement throttling
        if (event === 'TOKEN_REFRESHED') {
          const now = Date.now();
          if (now - lastRefreshTime < refreshThrottleTime) {

            return;
          }
          lastRefreshTime = now;
        }
        
        // Update state for allowed events
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session (once)
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      

      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
    } else {

    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
    } else {

    }
    
    return { error };
  };

  const signOut = async () => {
    try {

      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      } else {

        // Force redirect to auth page
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Force redirect even if there's an error
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
      loading
    }}>
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
