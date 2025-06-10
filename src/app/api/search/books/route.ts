
import type { Book } from '@/types';
import { NextResponse, type NextRequest } from 'next/server';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
// It's recommended to use an API key for Google Books API for better quota and reliability.
// const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

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
    id: item.id,
    title: volumeInfo.title || 'No title',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown author',
    coverImageUrl: imageLinks.thumbnail || imageLinks.smallThumbnail || 'https://placehold.co/300x450.png',
    summary: volumeInfo.description || 'No summary available.',
    averageRating: volumeInfo.averageRating,
    genres: volumeInfo.categories || [],
    publicationYear,
    isbn,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    // Add &key=API_KEY to the URL if you have an API key
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=20`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google Books API error:', errorData);
      return NextResponse.json({ error: `Google Books API error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    const books: Book[] = data.items ? data.items.map(formatGoogleBook) : [];
    
    return NextResponse.json(books);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch books from Google Books API', details: message }, { status: 500 });
  }
}
