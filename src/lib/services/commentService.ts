import type { Comment } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const API_BASE_URL = '/api'; // Adjust

export async function likeComment(commentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('likes')
    .upsert({
      user_id: user.id,
      comment_id: commentId,
    }, {
      onConflict: 'user_id,comment_id',
      ignoreDuplicates: true
    });

  if (error) throw error;
}

export async function unlikeComment(commentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('comment_id', commentId);

  if (error) throw error;
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) throw error;
}

// Add reply and edit comment would typically go into reviewService or listService
// depending on the entity the comment belongs to, or a generic comment service
// that takes entity_type and entity_id.
// For simplicity, primary comment creation is in reviewService/listService.
// This service is mainly for actions on existing comments.
