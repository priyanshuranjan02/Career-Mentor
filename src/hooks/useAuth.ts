import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  avatar_url?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
        }
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        setError('Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setError('Authentication error');
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create a basic one from user metadata
        if (error.code === 'PGRST116') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const basicProfile: UserProfile = {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              created_at: user.created_at,
              avatar_url: user.user_metadata?.avatar_url
            };
            setProfile(basicProfile);
          }
        } else {
          // For other errors, still try to create a basic profile
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const basicProfile: UserProfile = {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              created_at: user.created_at,
              avatar_url: user.user_metadata?.avatar_url
            };
            setProfile(basicProfile);
          }
        }
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback to basic profile
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const basicProfile: UserProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            created_at: user.created_at,
            avatar_url: user.user_metadata?.avatar_url
          };
          setProfile(basicProfile);
        }
      } catch (fallbackError) {
        console.error('Fallback profile creation failed:', fallbackError);
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        setError(error.message);
      }
    } catch (err) {
      console.error('Sign out failed:', err);
      setError('Failed to sign out');
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signOut
  };
};
