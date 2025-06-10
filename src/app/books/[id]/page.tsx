import Image from 'next/image';
import { mockBooks, mockReviews } from '@/lib/mock-data';
import type { Book } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Heart, ListPlus, Share2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateStaticParams() {
  return mockBooks.map((book) => ({
    id: book.id,
  }));
}

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const book = mockBooks.find((b) => b.id === params.id);
  const reviews = mockReviews.filter((r) => r.bookId === params.id);

  if (!book) {
    return <div className="text-center py-10">Book not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <div className="md:flex">
          <div className="md:w-1/3 relative aspect-[2/3] md:aspect-auto">
            <Image
              src={book.coverImageUrl}
              alt={`Cover of ${book.title}`}
              layout="fill"
              objectFit="cover"
              className=""
              data-ai-hint={book.dataAiHint || "book cover detail"}
            />
          </div>
          <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 font-headline text-primary">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-1">by {book.author}</p>
              {book.publicationYear && <p className="text-sm text-muted-foreground mb-3">Published in {book.publicationYear}</p>}
              
              {book.averageRating && (
                <div className="flex items-center mb-4">
                  <StarRating initialRating={book.averageRating} readonly size={24} />
                  <span className="ml-3 text-lg text-foreground">
                    {book.averageRating.toFixed(1)}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">({reviews.length} ratings)</span>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {book.genres?.map((genre) => (
                  <Badge key={genre} variant="secondary" className="transition-colors hover:bg-accent hover:text-accent-foreground">{genre}</Badge>
                ))}
              </div>

              <p className="text-foreground/80 leading-relaxed mb-6">{book.summary}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant="default" className="transition-transform hover:scale-105">
                <Heart className="mr-2 h-4 w-4" /> Rate / Log
              </Button>
              <Button variant="outline" className="transition-transform hover:scale-105">
                <ListPlus className="mr-2 h-4 w-4" /> Add to List
              </Button>
              <Button variant="outline" size="icon" className="transition-transform hover:scale-105">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Separator />

      <section>
        <h2 className="text-2xl font-bold mb-4 font-headline">Reviews</h2>
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-1 font-medium">Your Rating:</p>
                <StarRating count={5} size={28} onRatingChange={(rating) => console.log(rating)} />
              </div>
              <Textarea placeholder={`What did you think of "${book.title}"?`} className="min-h-[120px]" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="transition-transform hover:scale-105">
              <MessageSquare className="mr-2 h-4 w-4" /> Post Review
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-6 space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          ) : (
            <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to write one!</p>
          )}
        </div>
      </section>
    </div>
  );
}
