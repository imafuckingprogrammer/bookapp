import { BookCard } from '@/components/books/BookCard';
import { mockBooks } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DiscoverPage() {
  const allGenres = Array.from(new Set(mockBooks.flatMap(book => book.genres || [])));

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 font-headline text-primary">Discover Books</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="search" placeholder="Search by title, author, ISBN..." className="pl-10 w-full" />
          </div>
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
          <Button>Search</Button>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {mockBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
          {/* Add more books for a fuller discover page */}
          {mockBooks.map((book) => (
            <BookCard key={`${book.id}-clone`} book={{...book, id: `${book.id}-clone`}} />
          ))}
        </div>
      </section>

      <div className="text-center mt-8">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  );
}
