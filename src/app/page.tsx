
"use client";
import { useEffect, useState } from 'react';
import type { Book } from '@/types';
import { BookCard } from '@/components/books/BookCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { getPopularBooks, getRecentlyReviewedBooks } from '@/lib/services/bookService'; // Assuming you create these
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [recentlyReviewed, setRecentlyReviewed] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/feed'); // Redirect to feed if authenticated
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        const [popBooks, recentBooks] = await Promise.all([
          getPopularBooks(5), // Fetch 5 popular books
          // getRecentlyReviewedBooks(4) // You can add another section if desired
        ]);
        setPopularBooks(popBooks);
        // setRecentlyReviewed(recentBooks);
      } catch (error) {
        console.error("Failed to fetch homepage books:", error);
        // Handle error, maybe show a toast
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [isAuthenticated, router]);
  
  if (isAuthenticated) { // Should be handled by redirect, but as a fallback
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Redirecting to your feed...</p>
      </div>
    );
  }

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
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : popularBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">Could not load popular books at this time.</p>
        )}
      </section>
      
      {/* Example for another section like "Recently Reviewed" - adapt as needed
      <section>
        <h2 className="text-3xl font-bold mb-6 font-headline text-center">Recently Reviewed</h2>
        {isLoading ? (
           <div className="flex justify-center items-center py-10"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : recentlyReviewed.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentlyReviewed.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
             <div className="text-center mt-8">
                <Link href="/discover?sort=recent_reviews"> // Example filter
                    <Button variant="outline" className="transition-transform hover:scale-105">
                    View More Reviews <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-8">No recently reviewed books found.</p>
        )}
      </section>
      */}
    </div>
  );
}
