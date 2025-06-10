
import { BookCard } from '@/components/books/BookCard';
import { mockBooks } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const popularBooks = mockBooks.slice(0, 4); // Show first 4 mock books as "popular"

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-br from-primary/10 via-background to-background rounded-xl shadow-inner">
        <h1 className="text-5xl font-bold mb-4 font-headline text-primary">Welcome to LibroVision</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover your next favorite book, track your reading, and share your thoughts with a community of book lovers.
        </p>
        <div className="space-x-4">
          <Link href="/discover">
            <Button size="lg" className="transition-transform hover:scale-105">
              Discover Books <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/signup">
             <Button size="lg" variant="outline" className="transition-transform hover:scale-105">
              Join Now
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-6 font-headline text-center">Popular Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/discover">
            <Button variant="outline" className="transition-transform hover:scale-105">
              Explore More Books <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 
        The PersonalizedRecommendationsForm section has been removed.
        You can add other sections here for new features.
      */}
    </div>
  );
}
