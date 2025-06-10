
"use client"; // Make it a client component to handle interactions

import Image from 'next/image';
import { mockBooks, mockReviews, mockBookLists } from '@/lib/mock-data';
import type { Book, BookList } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Heart, ListPlus, Share2, MessageSquare, BookPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import Link from 'next/link';


// export async function generateStaticParams() {
//   return mockBooks.map((book) => ({
//     id: book.id,
//   }));
// }
// Removing generateStaticParams as this page is now dynamic client-side for interactions


export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<typeof mockReviews>([]);
  const [userLists, setUserLists] = useState<BookList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | undefined>(undefined);
  const [isAddToListDialogOpen, setIsAddToListDialogOpen] = useState(false);

  useEffect(() => {
    const foundBook = mockBooks.find((b) => b.id === params.id);
    if (foundBook) {
      setBook(JSON.parse(JSON.stringify(foundBook))); // Deep copy for potential local modifications
    }
    const foundReviews = mockReviews.filter((r) => r.bookId === params.id);
    setReviews(foundReviews);
    // Simulate fetching user's lists. In a real app, this would be an API call.
    setUserLists(mockBookLists.filter(list => list.userId === 'u1')); // Assuming 'u1' is current user
  }, [params.id]);


  if (!book) {
    return <div className="text-center py-10">Book not found.</div>;
  }

  const handleAddToList = () => {
    if (!selectedListId || !book) {
      toast({ title: "Error", description: "Please select a list.", variant: "destructive" });
      return;
    }
    // Simulate adding book to list. In a real app, this would be an API call.
    console.log(`Adding book "${book.title}" (ID: ${book.id}) to list ID: ${selectedListId}`);
    // Find the list in mockBookLists and add the book - this is a simulation
    // For true persistence, backend and global state management is needed
    const listIndex = mockBookLists.findIndex(l => l.id === selectedListId);
    if (listIndex > -1 && !mockBookLists[listIndex].books.find(b => b.id === book.id)) {
      // mockBookLists[listIndex].books.push(book); // This direct mutation is for simulation
      toast({ title: "Book Added (Simulated)", description: `"${book.title}" added to list.` });
    } else if (listIndex > -1) {
      toast({ title: "Already in List", description: `"${book.title}" is already in this list.`, variant: "default" });
    } else {
       toast({ title: "Error", description: `Could not find list.`, variant: "destructive" });
    }
    setIsAddToListDialogOpen(false);
    setSelectedListId(undefined);
  };


  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <div className="md:flex">
          <div className="md:w-1/3 relative aspect-[2/3] md:aspect-auto">
            <Image
              src={book.coverImageUrl || 'https://placehold.co/300x450.png'}
              alt={`Cover of ${book.title}`}
              layout="fill"
              objectFit="cover"
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
              
              <Dialog open={isAddToListDialogOpen} onOpenChange={setIsAddToListDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="transition-transform hover:scale-105">
                    <BookPlus className="mr-2 h-4 w-4" /> Add to List
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add "{book.title}" to a list</DialogTitle>
                    <DialogDescription>
                      Select one of your lists or create a new one.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {userLists.length > 0 ? (
                      <Select onValueChange={setSelectedListId} value={selectedListId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                        <SelectContent>
                          {userLists.map(list => (
                            <SelectItem key={list.id} value={list.id}>{list.name} ({list.books.length} books)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-muted-foreground">You don't have any lists yet. <Link href="/lists/new" className="text-primary hover:underline">Create one now!</Link></p>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                       <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleAddToList} disabled={!selectedListId || userLists.length === 0}>Add to selected list</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
                <StarRating count={5} size={28} onRatingChange={(rating) => console.log("New rating for this book:", rating)} />
              </div>
              <Textarea placeholder={`What did you think of "${book.title}"?`} className="min-h-[120px]" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="transition-transform hover:scale-105" onClick={() => toast({title: "Review Posted (Simulated)!"})}>
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
