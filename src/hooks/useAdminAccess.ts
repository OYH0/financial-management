
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAccess = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Use .maybeSingle() instead of .single() to prevent the 406 error
        // when the profile doesn't exist
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin access:', error);
          
          // For certain errors (like network issues), retry a few times
          if (retries < MAX_RETRIES) {
            setRetries(prev => prev + 1);
            setTimeout(checkAdminAccess, 1000); // Retry after 1 second
            return;
          }
          
          setIsAdmin(false);
        } else {
          // If data exists, use it, otherwise default to false
          setIsAdmin(Boolean(data?.is_admin));
          
          // If we don't have a profile yet, create one with admin=false
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
    };

    checkAdminAccess();
  }, [user, retries]);

  return { isAdmin, loading };
};
