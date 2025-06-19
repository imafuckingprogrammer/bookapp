import { supabase } from '@/lib/supabaseClient';

/**
 * Auth service for additional authentication functionality beyond the main AuthContext.
 * Most auth operations are handled directly in AuthContext, but this provides
 * utility functions for password reset, email verification, etc.
 */

export async function sendPasswordResetEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updateUserPassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function updateUserEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
}

export async function resendEmailConfirmation(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('No user email found');
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
  });
  if (error) throw error;
}
