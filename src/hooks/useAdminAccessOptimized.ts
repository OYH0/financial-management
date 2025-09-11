import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAccessOptimized = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Cache admin status to avoid repeated checks
  const [adminCache, setAdminCache] = useState<Map<string, boolean>>(new Map());

  const checkAdminAccess = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Check cache first
    if (adminCache.has(user.id)) {
      const cachedResult = adminCache.get(user.id)!;
      setIsAdmin(cachedResult);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      } else {
        const adminStatus = Boolean(data?.is_admin);
        setIsAdmin(adminStatus);
        
        // Cache the result
        setAdminCache(prev => new Map(prev.set(user.id, adminStatus)));
        
        // If no profile exists, create one
        if (!data && user.id) {
          try {
            await supabase.from('profiles').insert({
              id: user.id,
              email: user.email,
              is_admin: false
            });
            console.log('Created new user profile');
          } catch (insertError) {
            console.error('Error creating user profile:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [user, adminCache]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  // Clear cache when user changes
  useEffect(() => {
    if (!user) {
      setAdminCache(new Map());
    }
  }, [user]);

  return { 
    isAdmin, 
    loading,
    refreshAdmin: checkAdminAccess,
    clearCache: () => setAdminCache(new Map())
  };
};