
"use client";

import { useState } from 'react';
import type { Book } from '@/types';
import { BookCard } from '@/components/books/BookCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const allGenres = Array.from(new Set(mockBooks.flatMap(book => book.genres || []))); // Genre filter temporarily removed

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a search term.");
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/search/books?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      const data: Book[] = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        setError("No books found for your query.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to fetch books: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 font-headline text-primary">Discover Books</h1>
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by title, author..." 
              className="pl-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Genre filter temporarily removed for simplicity
          <Select>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {allGenres.map(genre => (
                <SelectItem key={genre} value={genre.toLowerCase()}>{genre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Search
          </Button>
        </form>
      </section>

      {error && !isLoading && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section>
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Searching for books...</p>
          </div>
        )}
        {!isLoading && searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {searchResults.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
        {!isLoading && searchResults.length === 0 && searchQuery && !error && (
           <div className="text-center py-10 text-muted-foreground">
            <p>No books found for "{searchQuery}". Try a different search term.</p>
          </div>
        )}
         {!isLoading && searchResults.length === 0 && !searchQuery && !error && (
           <div className="text-center py-10 text-muted-foreground">
            <p>Enter a search term above to find books.</p>
          </div>
        )}
      </section>

      {/* Load More button can be implemented later with pagination */}
      {/* 
      {!isLoading && searchResults.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline">Load More</Button>
        </div>
      )}
      */}
    </div>
  );
}
