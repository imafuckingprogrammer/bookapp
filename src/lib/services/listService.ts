import type { ListCollection, Book, PaginatedResponse, Comment } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const API_BASE_URL = '/api'; // Adjust

export async function createList(listData: Pick<ListCollection, 'name' | 'description' | 'is_public'>): Promise<ListCollection> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('list_collections')
    .insert({
      user_id: user.id,
      name: listData.name,
      description: listData.description,
      is_public: listData.is_public,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getListDetails(listId: string): Promise<ListCollection | null> {
  const { data, error } = await supabase
    .from('list_collections')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `)
    .eq('id', listId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateListDetails(listId: string, listData: Partial<Pick<ListCollection, 'name' | 'description' | 'is_public'>>): Promise<ListCollection> {
  const { data, error } = await supabase
    .from('list_collections')
    .update(listData)
    .eq('id', listId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteList(listId: string): Promise<void> {
  const { error } = await supabase
    .from('list_collections')
    .delete()
    .eq('id', listId);

  if (error) throw error;
}

export async function addBookToList(listId: string, bookId: string): Promise<void> {
  const { error } = await supabase
    .from('list_items')
    .insert({
      list_collection_id: listId,
      book_id: bookId,
    });

  if (error) throw error;
}

export async function removeBookFromList(listId: string, bookId: string): Promise<void> {
  const { error } = await supabase
    .from('list_items')
    .delete()
    .eq('list_collection_id', listId)
    .eq('book_id', bookId);

  if (error) throw error;
}

export async function getListBooks(listId: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Book>> {
  const { data, error, count } = await supabase
    .from('list_items')
    .select(`
      book:books(*)
    `, { count: 'exact' })
    .eq('list_collection_id', listId)
    .order('added_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw error;

  const books = (data || [])
    .filter((item: any) => item.book)
    .map((item: any) => ({
      id: item.book.id,
      google_book_id: item.book.google_book_id,
      title: item.book.title,
      author: Array.isArray(item.book.authors) ? item.book.authors.join(', ') : item.book.authors,
      coverImageUrl: item.book.cover_image_url,
      summary: item.book.summary,
      averageRating: item.book.average_rating,
      genres: item.book.genres || [],
      publicationYear: item.book.publication_year,
      isbn: item.book.isbn13 || item.book.isbn10,
    }));

  return {
    items: books,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function likeList(listId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('likes')
    .insert({
      user_id: user.id,
      list_collection_id: listId,
    });

  if (error) throw error;
}

export async function unlikeList(listId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', user.id)
    .eq('list_collection_id', listId);

  if (error) throw error;
}

export async function getListComments(listId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Comment>> {
  const { data, error, count } = await supabase
    .from('comments')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `, { count: 'exact' })
    .eq('list_collection_id', listId)
    .is('parent_comment_id', null)
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

export async function addCommentToList(listId: string, text: string, parentCommentId?: string): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: user.id,
      list_collection_id: listId,
      parent_comment_id: parentCommentId,
      text,
    })
    .select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function searchLists(query: string, page: number = 1, pageSize: number = 20, filters?: Record<string,any>): Promise<PaginatedResponse<ListCollection>> {
  const { data, error, count } = await supabase
    .from('list_collections')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url)
    `, { count: 'exact' })
    .eq('is_public', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
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

// More functions: updateListItemOrder, etc.
