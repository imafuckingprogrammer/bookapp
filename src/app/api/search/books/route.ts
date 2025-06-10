
import type { Book } from '@/types';
import { NextResponse, type NextRequest } from 'next/server';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
// const OPEN_LIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json'; // Example for Open Library

// It's recommended to use an API key for Google Books API for better quota and reliability.
const GOOGLE_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// Helper function to transform Google Books API item to our Book type
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

  let isbn;
  if (volumeInfo.industryIdentifiers) {
    const isbn13 = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
    if (isbn13) {
      isbn = isbn13.identifier;
    } else {
      const isbn10 = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
      if (isbn10) {
        isbn = isbn10.identifier;
      }
    }
  }

  return {
    id: item.id, // Using Google's ID as the primary external ID for now
    google_book_id: item.id,
    title: volumeInfo.title || 'No title',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown author',
    coverImageUrl: imageLinks.thumbnail || imageLinks.smallThumbnail || undefined, // Let client handle placeholder
    summary: volumeInfo.description || 'No summary available.',
    averageRating: volumeInfo.averageRating, // This is Google's rating, not app-wide
    genres: volumeInfo.categories || [],
    publicationYear,
    isbn,
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
  const maxResults = parseInt(maxResultsParam, 10);
  const startIndex = (page - 1) * maxResults;


  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    // --- Google Books API Call ---
    let googleBooksUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}`;
    if (GOOGLE_API_KEY) {
      googleBooksUrl += `&key=${GOOGLE_API_KEY}`;
    }
    const googleResponse = await fetch(googleBooksUrl);
    if (!googleResponse.ok) {
      const errorData = await googleResponse.text();
      console.error('Google Books API error:', errorData);
      // Don't fail the whole request if one API fails, try the other or return partial.
      // For now, if Google Books fails, we'll return an error.
      return NextResponse.json({ error: `Google Books API error: ${googleResponse.statusText}` }, { status: googleResponse.status });
    }
    const googleData = await googleResponse.json();
    const booksFromGoogle: Book[] = googleData.items ? googleData.items.map(formatGoogleBook) : [];

    // --- Open Library API Call (Conceptual) ---
    // In a real scenario, you might fetch from Open Library as well and merge results.
    // const openLibraryUrl = `${OPEN_LIBRARY_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=${maxResults}&offset=${startIndex}`;
    // const openLibraryResponse = await fetch(openLibraryUrl);
    // let booksFromOpenLibrary: Partial<Book>[] = [];
    // if (openLibraryResponse.ok) {
    //   const olData = await openLibraryResponse.json();
    //   booksFromOpenLibrary = olData.docs ? olData.docs.map(formatOpenLibraryBook) : [];
    // } else {
    //   console.warn('Open Library API error:', openLibraryResponse.statusText);
    // }

    // --- Merging and Deduplication Logic (Complex - Best handled by backend) ---
    // For now, we'll just return Google Books results.
    // A proper implementation would:
    // 1. Assign internal IDs if books don't exist in your DB.
    // 2. Merge data from multiple sources for the same book (e.g., more genres, summaries).
    // 3. Deduplicate based on ISBN or a combination of title/author.
    
    return NextResponse.json(booksFromGoogle);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch books from external APIs', details: message }, { status: 500 });
  }
}
