
"use client";

import { useState, type FormEvent } from 'react';
import type { Book, PaginatedResponse } from '@/types';
import { BookCard } from '@/components/books/BookCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { searchBooks } from '@/lib/services/bookService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Example filters - these would map to backend query parameters
const genres = ["Fiction", "Science Fiction", "Fantasy", "Mystery", "Thriller", "Non-Fiction", "History", "Biography"];
const publicationYears = ["2024", "2023", "2020s", "2010s", "2000s", "1990s", "Older"];
const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
];


export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSortBy, setSelectedSortBy] = useState<string>("relevance");

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>, page: number = 1) => {
    if (e) e.preventDefault();
    // No trim check needed here, can search with empty query for browsing with filters
    
    setIsLoading(true);
    setError(null);
    setCurrentPage(page);

    const filters = {
      genres: selectedGenres.join(','), // Example: "Fiction,Fantasy"
      publicationYear: selectedYear,
      sortBy: selectedSortBy,
    };
    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key as keyof typeof filters]) {
        delete filters[key as keyof typeof filters];
      }
    });

    try {
      const response: PaginatedResponse<Book> = await searchBooks(searchQuery, page, 20, filters);
      setSearchResults(response.items);
      setTotalPages(response.totalPages);
      if (response.items.length === 0 && (searchQuery || Object.keys(filters).length > 0)) {
        setError("No books found matching your criteria.");
      } else if (response.items.length === 0) {
        setError(null); // Clear error if no query/filters and no results (initial state)
      }
    } catch (err) {
      console.error("Search failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to fetch books: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Trigger search when filters change and there's a query or other filters active
  // This is a basic example; you might want to debounce or use a dedicated "Apply Filters" button
  // useEffect(() => {
  //   if (searchQuery || selectedGenres.length > 0 || selectedYear) {
  //     handleSearch(undefined, 1);
  //   }
  // }, [selectedGenres, selectedYear, selectedSortBy]); // Note: excluding searchQuery to avoid loop on type

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 font-headline text-primary">Discover Books</h1>
        <form onSubmit={(e) => handleSearch(e,1)} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by title, author, ISBN..." 
                className="pl-10 w-full" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading && currentPage === 1 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Search
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground mr-2">Filters:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4"/>Genre ({selectedGenres.length > 0 ? selectedGenres.length : 'Any'})</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Select Genres</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {genres.map(genre => (
                  <DropdownMenuCheckboxItem
                    key={genre}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => toggleGenre(genre)}
                  >
                    {genre}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4"/>Year ({selectedYear || 'Any'})</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Publication Year</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={!selectedYear} onCheckedChange={() => setSelectedYear("")}>Any Year</DropdownMenuCheckboxItem>
                {publicationYears.map(year => (
                  <DropdownMenuCheckboxItem
                    key={year}
                    checked={selectedYear === year}
                    onCheckedChange={() => setSelectedYear(selectedYear === year ? "" : year)}
                  >
                    {year}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4"/>Sort By ({sortOptions.find(s=>s.value === selectedSortBy)?.label || 'Relevance'})</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map(opt => (
                  <DropdownMenuCheckboxItem
                    key={opt.value}
                    checked={selectedSortBy === opt.value}
                    onCheckedChange={() => setSelectedSortBy(opt.value)}
                  >
                    {opt.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {(selectedGenres.length > 0 || selectedYear || selectedSortBy !== "relevance") && (
                <Button variant="ghost" size="sm" onClick={() => {
                    setSelectedGenres([]);
                    setSelectedYear("");
                    setSelectedSortBy("relevance");
                    handleSearch(undefined, 1); // Re-search with cleared filters if query exists
                }}>Clear Filters</Button>
            )}
          </div>
        </form>
      </section>

      {error && !isLoading && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section>
        {isLoading && searchResults.length === 0 && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Searching for books...</p>
          </div>
        )}
        {!isLoading && searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {searchResults.map((book) => (
              <BookCard key={book.id || book.google_book_id || book.open_library_id} book={book} />
            ))}
          </div>
        )}
        {!isLoading && searchResults.length === 0 && (searchQuery || selectedGenres.length > 0 || selectedYear) && !error && (
           <div className="text-center py-10 text-muted-foreground">
            <p>No books found for your current search and filters. Try adjusting them.</p>
          </div>
        )}
         {!isLoading && searchResults.length === 0 && !searchQuery && selectedGenres.length === 0 && !selectedYear && !error && (
           <div className="text-center py-10 text-muted-foreground">
            <p>Enter a search term or apply filters to find books.</p>
          </div>
        )}
      </section>

      {!isLoading && searchResults.length > 0 && totalPages > 1 && (
         <div className="flex justify-center items-center space-x-2 mt-8">
          <Button 
            variant="outline" 
            onClick={() => handleSearch(undefined, currentPage - 1)} 
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button 
            variant="outline" 
            onClick={() => handleSearch(undefined, currentPage + 1)} 
            disabled={currentPage >= totalPages || isLoading}
          >
             {isLoading && currentPage < totalPages ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
