import type { Book, PaginatedResponse, Review, UserBookInteraction } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const API_BASE_URL = '/api'; // Adjust if your API routes are different

/**
 * Searches for books from multiple sources (Google Books, Open Library).
 * In a real backend, this merging and deduplication would happen there.
 * This client-side stub will primarily use the existing Google Books API route.
 */
export async function searchBooks(query: string, page: number = 1, pageSize: number = 20, filters?: Record<string,any>): Promise<PaginatedResponse<Book>> {
  if (!query.trim()) {
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }

  try {
    const params = new URLSearchParams({
      q: query.trim(),
      page: page.toString(),
      maxResults: pageSize.toString(),
    });

    console.log('Searching for books with query:', query);
    const response = await fetch(`/api/search/books?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Search API error:', errorData);
      throw new Error(errorData.error || `Search failed: ${response.statusText}`);
    }
    
    const items = await response.json();
    console.log('Search returned:', items.length, 'items');
    
    return {
      items: items || [],
      total: items.length,
      page,
      pageSize,
      totalPages: Math.ceil(items.length / pageSize),
    };
  } catch (error) {
    console.error('Search books error:', error);
    throw error;
  }
}

export async function getBookDetails(bookId: string): Promise<Book | null> {
  try {
    // First try to get from our database
    const { data: dbBook } = await supabase
      .from('books')
      .select('*')
      .or(`id.eq.${bookId},google_book_id.eq.${bookId}`)
      .single();

    if (dbBook) {
      return {
        id: dbBook.id,
        google_book_id: dbBook.google_book_id,
        title: dbBook.title,
        author: Array.isArray(dbBook.authors) ? dbBook.authors.join(', ') : dbBook.authors,
        coverImageUrl: dbBook.cover_image_url,
        summary: dbBook.summary,
        averageRating: dbBook.average_rating,
        genres: dbBook.genres || [],
        publicationYear: dbBook.publication_year,
        isbn: dbBook.isbn13 || dbBook.isbn10,
      };
    }

    // Fallback to Google Books API
    const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
    let url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
    if (GOOGLE_API_KEY) url += `?key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const googleBook = await response.json();
    // Format and cache this book (implementation similar to search API)
    
    return null; // Placeholder - implement Google Books formatting
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}

export async function getBookReviews(bookId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Review>> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      user:user_profiles(id, username, avatar_url),
      book:books(id, title, cover_image_url)
    `, { count: 'exact' })
    .eq('book_id', bookId)
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

export async function addBookReview(bookId: string, rating: number, reviewText?: string): Promise<Review> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      rating,
      review_text: reviewText,
    }, { 
      onConflict: 'user_id,book_id' 
    })
    .select(`
      *,
      user:user_profiles(id, username, avatar_url),
      book:books(id, title, cover_image_url)
    `)
    .single();

  if (error) throw error;
  
  return {
    ...data,
    current_user_has_liked: false
  };
}

export async function updateUserBookInteraction(bookId: string, interaction: Partial<UserBookInteraction>): Promise<UserBookInteraction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_book_interactions')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      ...interaction,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserBookInteraction(bookId: string): Promise<UserBookInteraction | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_book_interactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user interaction:', error);
    return null;
  }
}

// Add more functions as needed: likeBook, unlikeBook, etc.
// These would typically be part of updateUserBookInteraction or dedicated endpoints.

export async function likeBook(bookId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_book_interactions')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      is_liked: true,
    });

  if (error) throw error;
}

export async function unlikeBook(bookId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_book_interactions')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      is_liked: false,
    });

  if (error) throw error;
}

export async function getPopularBooks(limit: number = 5): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('average_rating', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(book => ({
    id: book.id,
    google_book_id: book.google_book_id,
    title: book.title,
    author: Array.isArray(book.authors) ? book.authors.join(', ') : book.authors,
    coverImageUrl: book.cover_image_url,
    summary: book.summary,
    averageRating: book.average_rating,
    genres: book.genres || [],
    publicationYear: book.publication_year,
    isbn: book.isbn13 || book.isbn10,
  }));
}

// Similarly for recently_reviewed_books, new_releases etc. for the homepage.
export async function getRecentlyReviewedBooks(limit: number = 4): Promise<Book[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      book:books(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || [])
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
}
