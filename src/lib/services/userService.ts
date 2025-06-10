
import type { UserProfile, PaginatedResponse, Book, Review, ListCollection, UserBookInteraction } from '@/types';

const API_BASE_URL = '/api'; // Adjust

export async function getUserProfile(username: string): Promise<UserProfile | null> {
  console.log(`[UserService Stub] Fetching profile for username: ${username}`);
  // const response = await fetch(`${API_BASE_URL}/users/${username}/profile`);
  // if (!response.ok) {
  //   if (response.status === 404) return null;
  //   throw new Error('Failed to fetch user profile');
  // }
  // return response.json();
  if (username === "alicereads") {
     return {
        id: "mock-user-id-alice",
        username: "alicereads",
        avatar_url: "https://placehold.co/128x128.png",
        bio: "Avid reader, aspiring writer. Loves classics and sci-fi.",
        created_at: "2023-01-15T10:00:00Z",
        name: "Alice Wonderland",
        follower_count: 150,
        following_count: 75,
        is_current_user_following: false, // Assume current user is not Alice for this stub
    };
  }
  return Promise.resolve(null);
}

export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
  console.log(`[UserService Stub] Updating user profile:`, profileData);
  // const response = await fetch(`${API_BASE_URL}/user/profile`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json', /* Authorization header */ },
  //   body: JSON.stringify(profileData),
  // });
  // if (!response.ok) throw new Error('Failed to update profile');
  // return response.json();
  const mockProfile: UserProfile = {
    id: "current-user-id-stub",
    username: "currentuser",
    created_at: new Date().toISOString(),
    ...profileData,
  };
  return Promise.resolve(mockProfile);
}

export async function searchUsers(query: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<UserProfile>> {
  console.log(`[UserService Stub] Searching users for query: "${query}", page: ${page}`);
  // const response = await fetch(`${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
  // if (!response.ok) throw new Error('Failed to search users');
  // return response.json();
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function followUser(userIdToFollow: string): Promise<void> {
  console.log(`[UserService Stub] Following user: ${userIdToFollow}`);
  // await fetch(`${API_BASE_URL}/users/${userIdToFollow}/follow`, { method: 'POST', headers: { /* Auth */ } });
  return Promise.resolve();
}

export async function unfollowUser(userIdToUnfollow: string): Promise<void> {
  console.log(`[UserService Stub] Unfollowing user: ${userIdToUnfollow}`);
  // await fetch(`${API_BASE_URL}/users/${userIdToUnfollow}/follow`, { method: 'DELETE', headers: { /* Auth */ } });
  return Promise.resolve();
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
  console.log(`[UserService Stub] Fetching read books for user: ${userId}, page: ${page}`);
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function getUserWatchlist(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<UserBookInteraction>> {
  console.log(`[UserService Stub] Fetching watchlist for user: ${userId}, page: ${page}`);
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function getUserLikedBooks(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<UserBookInteraction>> {
  console.log(`[UserService Stub] Fetching liked books for user: ${userId}, page: ${page}`);
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function getUserOwnedBooks(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<UserBookInteraction>> {
  console.log(`[UserService Stub] Fetching owned books for user: ${userId}, page: ${page}`);
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function getUserReviews(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Review>> {
  console.log(`[UserService Stub] Fetching reviews by user: ${userId}, page: ${page}`);
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function getUserLists(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<ListCollection>> {
  console.log(`[UserService Stub] Fetching lists by user: ${userId}, page: ${page}`);
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
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
