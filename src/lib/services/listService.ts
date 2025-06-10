
import type { ListCollection, Book, PaginatedResponse, Comment } from '@/types';

const API_BASE_URL = '/api'; // Adjust

export async function createList(listData: Pick<ListCollection, 'name' | 'description' | 'is_public'>): Promise<ListCollection> {
  console.log(`[ListService Stub] Creating list:`, listData);
  // const response = await fetch(`${API_BASE_URL}/lists`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', /* Authorization header */ },
  //   body: JSON.stringify(listData),
  // });
  // if (!response.ok) throw new Error('Failed to create list');
  // return response.json();
  const mockList: ListCollection = {
    id: `list-${Date.now()}`,
    user_id: "current-user-id-stub",
    name: listData.name,
    description: listData.description,
    is_public: listData.is_public,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    item_count: 0,
    like_count: 0,
    current_user_has_liked: false,
    books: [],
  };
  return Promise.resolve(mockList);
}

export async function getListDetails(listId: string): Promise<ListCollection | null> {
  console.log(`[ListService Stub] Fetching details for listId: ${listId}`);
  // const response = await fetch(`${API_BASE_URL}/lists/${listId}`);
  // if (!response.ok) {
  //   if (response.status === 404) return null;
  //   throw new Error('Failed to fetch list details');
  // }
  // return response.json();
  if (listId === "l1") { // Sample from old mock
    return {
      id: "l1",
      user_id: "mock-user-id-alice",
      name: "Must-Read Classics Reimagined",
      description: "A collection of timeless literary masterpieces, ready for the backend.",
      is_public: true,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      item_count: 2,
      like_count: 35,
      current_user_has_liked: false,
      user: { id: "mock-user-id-alice", username: "alicereads", created_at: new Date().toISOString() },
      books: [
        { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverImageUrl: 'https://placehold.co/300x450.png' },
        { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverImageUrl: 'https://placehold.co/300x450.png' },
      ],
      cover_images: ['https://placehold.co/300x450.png', 'https://placehold.co/300x450.png']
    };
  }
  return Promise.resolve(null);
}

export async function updateListDetails(listId: string, listData: Partial<Pick<ListCollection, 'name' | 'description' | 'is_public'>>): Promise<ListCollection> {
  console.log(`[ListService Stub] Updating list ${listId}:`, listData);
  // const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json', /* Authorization header */ },
  //   body: JSON.stringify(listData),
  // });
  // if (!response.ok) throw new Error('Failed to update list');
  // return response.json();
  const currentList = await getListDetails(listId);
  if (!currentList) throw new Error("List not found for update");
  return Promise.resolve({ ...currentList, ...listData, updated_at: new Date().toISOString() });
}

export async function deleteList(listId: string): Promise<void> {
  console.log(`[ListService Stub] Deleting list: ${listId}`);
  // await fetch(`${API_BASE_URL}/lists/${listId}`, { method: 'DELETE', headers: { /* Auth */ } });
  return Promise.resolve();
}

export async function addBookToList(listId: string, bookId: string): Promise<void> {
  console.log(`[ListService Stub] Adding book ${bookId} to list ${listId}`);
  // await fetch(`${API_BASE_URL}/lists/${listId}/books`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', /* Authorization header */ },
  //   body: JSON.stringify({ book_id: bookId }),
  // });
  return Promise.resolve();
}

export async function removeBookFromList(listId: string, bookId: string): Promise<void> {
  console.log(`[ListService Stub] Removing book ${bookId} from list ${listId}`);
  // await fetch(`${API_BASE_URL}/lists/${listId}/books/${bookId}`, { method: 'DELETE', headers: { /* Auth */ } });
  return Promise.resolve();
}

export async function getListBooks(listId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Book>> {
    console.log(`[ListService Stub] Getting books for list ${listId}`);
    return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}


export async function likeList(listId: string): Promise<void> {
  console.log(`[ListService Stub] Liking list ${listId}`);
  // await fetch(`${API_BASE_URL}/lists/${listId}/like`, { method: 'POST', headers: { /* Auth */ } });
  return Promise.resolve();
}

export async function unlikeList(listId: string): Promise<void> {
  console.log(`[ListService Stub] Unliking list ${listId}`);
  // await fetch(`${API_BASE_URL}/lists/${listId}/like`, { method: 'DELETE', headers: { /* Auth */ } });
  return Promise.resolve();
}

export async function getListComments(listId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Comment>> {
  console.log(`[ListService Stub] Getting comments for list ${listId}`);
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

export async function addCommentToList(listId: string, text: string, parentCommentId?: string): Promise<Comment> {
  console.log(`[ListService Stub] Adding comment to list ${listId}: "${text}" (reply to: ${parentCommentId})`);
  const mockComment: Comment = {
    id: `comment-${Date.now()}`,
    user_id: "current-user-id-stub",
    list_collection_id: listId,
    parent_comment_id: parentCommentId,
    text,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    like_count: 0,
    current_user_has_liked: false,
    user: { id: "current-user-id-stub", username: "currentuser", created_at: new Date().toISOString() },
  };
  return Promise.resolve(mockComment);
}


export async function searchLists(query: string, page: number = 1, pageSize: number = 20, filters?: Record<string,any>): Promise<PaginatedResponse<ListCollection>> {
  console.log(`[ListService Stub] Searching lists for query: "${query}", page: ${page}, filters:`, filters);
  // const response = await fetch(`${API_BASE_URL}/search/lists?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
  // if (!response.ok) throw new Error('Failed to search lists');
  // return response.json();
  return Promise.resolve({ items: [], total: 0, page, pageSize, totalPages: 0 });
}

// More functions: updateListItemOrder, etc.
