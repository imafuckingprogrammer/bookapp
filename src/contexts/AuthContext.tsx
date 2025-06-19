"use client";

import type { AuthUser, UserProfile } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { updateUserProfile } from '@/lib/services/userService';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  authUser: AuthUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  updateProfile: (profileData: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatar_url'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          follower_count:follows!following_id(count),
          following_count:follows!follower_id(count)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return {
        ...data,
        follower_count: data.follower_count?.[0]?.count || 0,
        following_count: data.following_count?.[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email });
        fetchUserProfile(session.user.id).then(setUserProfile);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthUser({ id: session.user.id, email: session.user.email });
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setAuthUser(null);
          setUserProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });
      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatar_url'>>) => {
    if (!authUser) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      const updatedProfile = await updateUserProfile(authUser.id, profileData);
      setUserProfile(updatedProfile);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      authUser, 
      userProfile, 
      isLoading, 
      isAuthenticated: !!authUser, 
      login, 
      signup, 
      logout, 
      fetchUserProfile,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
