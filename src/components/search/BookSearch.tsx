"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, X, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { searchBooks } from '@/lib/services/bookService';
import type { Book } from '@/types';
import Image from 'next/image';

interface BookSearchProps {
  onBookSelect?: (book: Book) => void;
  placeholder?: string;
  maxResults?: number;
  className?: string;
}

export function BookSearch({ 
  onBookSelect, 
  placeholder = "Search by title, author, ISBN...",
  maxResults = 8,
  className = ""
}: BookSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // BookTracker's debounced search
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await searchBooks(searchQuery, 1, maxResults);
      setResults(response.items);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [maxResults]);

  // Effect for debounced search (300ms like BookTracker)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (query.trim()) {
        debouncedSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
        setError(null);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, debouncedSearch]);

  // BookTracker's keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleBookSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  const handleBookSelect = (book: Book) => {
    if (onBookSelect) {
      onBookSelect(book);
    }
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError(null);
    searchInputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {query && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <Card className="absolute top-full z-50 mt-1 w-full shadow-lg">
          <CardContent className="p-0">
            {error && (
              <div className="p-4 text-sm text-destructive border-b">
                {error}
              </div>
            )}
            {results.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {results.map((book, index) => (
                  <div
                    key={book.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-muted ${
                      index === selectedIndex ? 'bg-muted' : ''
                    } ${index < results.length - 1 ? 'border-b' : ''}`}
                    onClick={() => handleBookSelect(book)}
                  >
                    <div className="flex-shrink-0">
                      {book.coverImageUrl ? (
                        <Image
                          src={book.coverImageUrl}
                          alt={book.title}
                          width={40}
                          height={60}
                          className="rounded object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-15 bg-muted rounded flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                      {book.publicationYear && (
                        <p className="text-xs text-muted-foreground">{book.publicationYear}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {results.length === 0 && !error && query && !isLoading && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No books found for "{query}"
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 