import { NextResponse, type NextRequest } from 'next/server';
import type { Book } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
// const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json'; // Example for Open Library

// It's recommended to use an API key for Google Books API for better quota and reliability.
const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// BookTracker's image optimization
function getOptimizedBookCoverUrl(imageLinks?: { [key: string]: string }): string | null {
  if (!imageLinks) return null;
  
  const imageTypes = ['extraLarge', 'large', 'medium', 'small', 'thumbnail'];
  let imageUrl = null;
  
  for (const type of imageTypes) {
    if (imageLinks[type]) {
      imageUrl = imageLinks[type];
      break;
    }
  }
  
  if (imageUrl) {
    imageUrl = imageUrl
      .replace('http://', 'https://')
      .replace('zoom=1', 'zoom=3')
      .replace('&edge=curl', '')
      .replace('&source=gbs_api', '');
  }
  
  return imageUrl;
}

// Format for LibroVision's existing Book type
function formatGoogleBook(item: any): Book {
  const volumeInfo = item.volumeInfo || {};
  const imageLinks = volumeInfo.imageLinks || {};
  
  let publicationYear;
  if (volumeInfo.publishedDate) {
    const yearMatch = volumeInfo.publishedDate.match(/\d{4}/);
    if (yearMatch) {
      publicationYear = parseInt(yearMatch[0], 10);
    }
  }

  const isbn10 = volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier;
  const isbn13 = volumeInfo.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier;

  // Clean description
  const description = volumeInfo.description 
    ? volumeInfo.description.replace(/<[^>]*>/g, '').trim()
    : 'No description available.';

  return {
    id: item.id,
    google_book_id: item.id,
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
    coverImageUrl: getOptimizedBookCoverUrl(volumeInfo.imageLinks) || undefined,
    summary: description,
    averageRating: volumeInfo.averageRating,
    genres: volumeInfo.categories || [],
    publicationYear,
    isbn: isbn13 || isbn10,
  };
}

// Example Helper for Open Library (needs to be adapted based on actual response structure)
// function formatOpenLibraryBook(doc: any): Partial<Book> {
//   return {
//     open_library_id: doc.key?.replace('/works/', ''),
//     title: doc.title || 'No title',
//     author: doc.author_name ? doc.author_name.join(', ') : 'Unknown author',
//     publicationYear: doc.first_publish_year,
//     isbn: doc.isbn ? doc.isbn[0] : undefined, // OL provides an array
//     // coverImageUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined,
//   };
// }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const pageParam = searchParams.get('page') || '1';
  const maxResultsParam = searchParams.get('maxResults') || '20';

  const page = parseInt(pageParam, 10);
  const maxResults = Math.min(parseInt(maxResultsParam, 10), 40);
  const startIndex = (page - 1) * maxResults;

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ error: 'Search query required' }, { status: 400 });
  }

  try {
    // BookTracker's enhanced query processing
    let searchQuery = query.trim();
    
    // Build API URL with BookTracker's parameters
    let googleBooksUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(searchQuery)}&startIndex=${startIndex}&maxResults=${maxResults}&printType=books&orderBy=relevance`;
    
    // Only add API key if it's properly configured (not the placeholder value)
    if (GOOGLE_API_KEY && GOOGLE_API_KEY !== 'your_google_books_api_key_here') {
      googleBooksUrl += `&key=${GOOGLE_API_KEY}`;
    }

    console.log('Searching Google Books with URL:', googleBooksUrl);

    const response = await fetch(googleBooksUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'LibroVision/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Books API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: googleBooksUrl
      });
      return NextResponse.json({ 
        error: `API error: ${response.statusText}`,
        details: errorText 
      }, { status: response.status });
    }

    const googleData = await response.json();
    console.log('Google Books API response:', {
      totalItems: googleData.totalItems,
      itemsCount: googleData.items?.length || 0
    });
    
    if (!googleData.items || googleData.items.length === 0) {
      console.log('No books found for query:', query);
      return NextResponse.json([]);
    }

    // Format books and cache them
    const formattedBooks: Book[] = googleData.items
      .filter((book: any) => book.volumeInfo && book.volumeInfo.title)
      .map(formatGoogleBook);

    console.log('Formatted books count:', formattedBooks.length);

    // Cache books in database for future use
    for (const book of formattedBooks) {
      try {
        await supabase.from('books').upsert({
          id: book.id,
          google_book_id: book.google_book_id,
          title: book.title,
          authors: book.author ? [book.author] : [],
          cover_image_url: book.coverImageUrl,
          summary: book.summary,
          publication_year: book.publicationYear,
          isbn13: book.isbn?.length === 13 ? book.isbn : null,
          isbn10: book.isbn?.length === 10 ? book.isbn : null,
          genres: book.genres || [],
          average_rating: book.averageRating || 0,
          total_ratings: 0,
        }, { onConflict: 'google_book_id' });
      } catch (cacheError) {
        console.warn('Cache error for book:', book.id, cacheError);
      }
    }

    return NextResponse.json(formattedBooks);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ 
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
