import type { Review, Comment, PaginatedResponse } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const API_BASE_URL = '/api'; // Adjust

export async function getReviewDetails(reviewId: string): Promise<Review | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  // First get the basic review data
  const { data: reviewData, error: reviewError } = await supabase
    .from('reviews')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url),
      book:books(id, title, cover_image_url)
    `)
    .eq('id', reviewId)
    .single();

  if (reviewError && reviewError.code !== 'PGRST116') throw reviewError;
  if (!reviewData) return null;

  // Check if current user has liked this review (if authenticated)
  let current_user_has_liked = false;
  if (user) {
    const { data: likeData } = await supabase
      .from('likes')
      .select('user_id')
      .eq('review_id', reviewId)
      .eq('user_id', user.id)
      .single();
    
    current_user_has_liked = !!likeData;
  }

  return {
    ...reviewData,
    current_user_has_liked
  };
}

export async function updateReview(reviewId: string, rating: number, reviewText?: string): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating,
      review_text: reviewText,
    })
    .eq('id', reviewId)
    .select(`
      *,
      user:user_profiles(id, username, avatar_url),
      book:books(id, title, cover_image_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteReview(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}

export async function likeReview(reviewId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('likes')
    .upsert({
      user_id: user.id,
      review_id: reviewId,
    }, {
      onConflict: 'user_id,review_id',
      ignoreDuplicates: true
    });

  if (error) throw error;
}

export async function unlikeReview(reviewId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('review_id', reviewId);

  if (error) throw error;
}

// Helper function to fetch replies recursively
async function fetchCommentReplies(commentId: string, user: any): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `)
    .eq('parent_comment_id', commentId)
    .order('created_at', { ascending: true });

  if (error) return [];

  // Get like status for each reply
  const repliesWithLikeStatus = await Promise.all((data || []).map(async (reply) => {
    let current_user_has_liked = false;
    if (user) {
      const { data: likeData } = await supabase
        .from('likes')
        .select('user_id')
        .eq('comment_id', reply.id)
        .eq('user_id', user.id)
        .single();
      
      current_user_has_liked = !!likeData;
    }

    // Recursively fetch nested replies
    const nestedReplies = await fetchCommentReplies(reply.id, user);

    return {
      ...reply,
      current_user_has_liked,
      replies: nestedReplies
    };
  }));

  return repliesWithLikeStatus;
}

export async function getReviewComments(reviewId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Comment>> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error, count } = await supabase
    .from('comments')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `, { count: 'exact' })
    .eq('review_id', reviewId)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  // Get like status and replies for each comment
  const commentsWithLikeStatusAndReplies = await Promise.all((data || []).map(async (comment) => {
    let current_user_has_liked = false;
    if (user) {
      const { data: likeData } = await supabase
        .from('likes')
        .select('user_id')
        .eq('comment_id', comment.id)
        .eq('user_id', user.id)
        .single();
      
      current_user_has_liked = !!likeData;
    }

    // Fetch replies
    const replies = await fetchCommentReplies(comment.id, user);

    return {
      ...comment,
      current_user_has_liked,
      replies
    };
  }));

  return {
    items: commentsWithLikeStatusAndReplies,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function addCommentToReview(reviewId: string, text: string, parentCommentId?: string): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      review_id: reviewId,
      parent_comment_id: parentCommentId,
      text,
    })
    .select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    current_user_has_liked: false,
    replies: []
  };
}
