import type { UserProfile, PaginatedResponse, UserBookInteraction, Review, ListCollection } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export async function getUserProfile(username: string): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        follower_count:follows!following_id(count),
        following_count:follows!follower_id(count)
      `)
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    // Check if current user is following this profile
    let is_current_user_following = false;
    if (user && user.id !== data.id) {
      const { data: followData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('following_id', data.id)
        .single();
      
      is_current_user_following = !!followData;
    }

    return {
      ...data,
      follower_count: data.follower_count?.[0]?.count || 0,
      following_count: data.following_count?.[0]?.count || 0,
      is_current_user_following,
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, profileData: Partial<Pick<UserProfile, 'name' | 'bio' | 'avatar_url'>>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('id', userId)
    .select(`
      *,
      follower_count:follows!following_id(count),
      following_count:follows!follower_id(count)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    follower_count: data.follower_count?.[0]?.count || 0,
    following_count: data.following_count?.[0]?.count || 0,
  };
}

export async function searchUsers(query: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<UserProfile>> {
  const { data, error, count } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact' })
    .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
    .order('username')
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function followUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('follows')
    .upsert({
      follower_id: user.id,
      following_id: userId,
    }, { 
      onConflict: 'follower_id,following_id',
      ignoreDuplicates: true 
    });

  if (error) throw error;
}

export async function unfollowUser(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId);

  if (error) throw error;
}

export async function getUserFollowers(userId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<UserProfile>> {
    console.log(`[UserService Stub] Getting followers for user: ${userId}`);
    return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function getUserFollowing(userId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<UserProfile>> {
    console.log(`[UserService Stub] Getting following for user: ${userId}`);
    return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}


// --- User specific book/list/review data ---

export async function getUserReadBooks(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<UserBookInteraction>> {
  const { data, error, count } = await supabase
    .from('user_book_interactions')
    .select(`
      *,
      book:books(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_read', true)
    .order('read_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getUserWatchlist(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<UserBookInteraction>> {
  const { data, error, count } = await supabase
    .from('user_book_interactions')
    .select(`
      *,
      book:books(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_on_watchlist', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getUserLikedBooks(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<UserBookInteraction>> {
  const { data, error, count } = await supabase
    .from('user_book_interactions')
    .select(`
      *,
      book:books(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_liked', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getUserOwnedBooks(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<UserBookInteraction>> {
  const { data, error, count } = await supabase
    .from('user_book_interactions')
    .select(`
      *,
      book:books(*)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_owned', true)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getUserReviews(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Review>> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url),
      book:books(id, title, cover_image_url)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  // Get like status for each review if user is authenticated
  const reviewsWithLikeStatus = await Promise.all((data || []).map(async (review) => {
    let current_user_has_liked = false;
    if (user) {
      const { data: likeData } = await supabase
        .from('likes')
        .select('user_id')
        .eq('review_id', review.id)
        .eq('user_id', user.id)
        .single();
      
      current_user_has_liked = !!likeData;
    }

    return {
      ...review,
      current_user_has_liked
    };
  }));

  return {
    items: reviewsWithLikeStatus,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getUserLists(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<ListCollection>> {
  const { data, error, count } = await supabase
    .from('list_collections')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  return {
    items: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getHomeFeed(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<any /* FeedItemType */>> {
  console.log(`[UserService Stub] Fetching home feed, page: ${page}`);
  // FeedItemType would be a discriminated union of different activities (new review, new list, follow activity etc.)
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function getNotifications(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Notification>> {
  console.log(`[UserService Stub] Fetching notifications, page: ${page}`);
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function markNotificationsAsRead(notificationIds?: string[]): Promise<void> {
  console.log(`[UserService Stub] Marking notifications as read:`, notificationIds || 'all');
  return Promise.resolve();
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        follower_count:follows!following_id(count),
        following_count:follows!follower_id(count)
      `)
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error fetching profile by username:', error);
      return null;
    }

    return {
      ...data,
      follower_count: data.follower_count?.[0]?.count || 0,
      following_count: data.following_count?.[0]?.count || 0,
    };
  } catch (error) {
    console.error('Error in getUserByUsername:', error);
    return null;
  }
}

export async function checkIfFollowing(userId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}
