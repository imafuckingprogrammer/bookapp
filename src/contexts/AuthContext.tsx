
"use client";

import type { AuthUser, UserProfile } from '@/types';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
// import { supabase } from '@/lib/supabaseClient'; // You will uncomment this

interface AuthContextType {
  authUser: AuthUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>; // Adjust as per your auth provider
  signup: (email: string, password: string, username: string) => Promise<void>; // Adjust
  logout: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>; // Added
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, you'd use Supabase auth listeners here
  useEffect(() => {
    // Simulate initial auth check
    setIsLoading(true);
    // const session = supabase.auth.session(); // Uncomment for Supabase
    // if (session?.user) {
    //   setAuthUser(session.user);
    //   fetchUserProfile(session.user.id).then(setUserProfile);
    // }
    // For now, simulate no user logged in
    setAuthUser(null); 
    setUserProfile(null);
    setIsLoading(false);

    // const { data: authListener } = supabase.auth.onAuthStateChange(
    //   async (_event, session) => {
    //     setAuthUser(session?.user ?? null);
    //     if (session?.user) {
    //       fetchUserProfile(session.user.id).then(setUserProfile);
    //     } else {
    //       setUserProfile(null);
    //     }
    //     setIsLoading(false);
    //   }
    // );
    // return () => {
    //   authListener?.subscription.unsubscribe();
    // };
  }, []);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log(`[AuthContext] Stub: fetchUserProfile for ${userId}`);
    // This would be an API call:
    // const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
    // if (error) { console.error('Error fetching profile:', error); return null; }
    // return data;
    
    // TEMPORARY MOCK until backend is connected
    if (userId === "mock-user-id-alice") {
        return {
            id: "mock-user-id-alice",
            username: "alicereads",
            avatar_url: "https://placehold.co/128x128.png",
            bio: "Avid reader, aspiring writer.",
            created_at: new Date().toISOString(),
            name: "Alice Wonderland",
            follower_count: 10,
            following_count: 5,
        };
    }
    return null;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("[AuthContext] Stub: login with", email);
    // const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    // if (error) { console.error("Login error:", error.message); throw error; }
    // if (data.user) {
    //   setAuthUser(data.user);
    //   const profile = await fetchUserProfile(data.user.id);
    //   setUserProfile(profile);
    // }
    // setIsLoading(false);

    // Simulate login for development
    const mockAuthUser = { id: "mock-user-id-alice", email };
    setAuthUser(mockAuthUser);
    const profile = await fetchUserProfile(mockAuthUser.id);
    setUserProfile(profile);
    setIsLoading(false);
    // End simulation
  };

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    console.log("[AuthContext] Stub: signup with", email, username);
    // const { error, data } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    // if (error) { console.error("Signup error:", error.message); throw error; }
    // // Supabase automatically signs in the user and onAuthStateChange will handle setting user and profile.
    // setIsLoading(false);
    // return data;
    
    // Simulate signup for development
    const mockAuthUser = { id: "mock-user-id-new", email };
    setAuthUser(mockAuthUser);
    // Simulate profile creation, in real app this would be a DB insert possibly via edge function
    const newProfile: UserProfile = {
        id: mockAuthUser.id,
        username,
        created_at: new Date().toISOString(),
        follower_count: 0,
        following_count: 0,
    };
    setUserProfile(newProfile);
    setIsLoading(false);
    // End simulation
  };

  const logout = async () => {
    setIsLoading(true);
    console.log("[AuthContext] Stub: logout");
    // const { error } = await supabase.auth.signOut();
    // if (error) { console.error("Logout error:", error.message); throw error; }
    setAuthUser(null);
    setUserProfile(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ authUser, userProfile, isLoading, isAuthenticated: !!authUser, login, signup, logout, fetchUserProfile }}>
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
