
"use client"; 

import Image from 'next/image';
import { mockBooks, mockReviews, mockBookLists } from '@/lib/mock-data';
import type { Book, BookList, Review as ReviewType } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Heart, ListPlus, Share2, MessageSquare, BookOpenCheck, Bookmark, Edit, ThumbsUp, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogBookDialog } from '@/components/books/LogBookDialog'; // New Dialog
import { format } from 'date-fns';


export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  // Use a more descriptive name for the book state that can be updated locally
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [userLists, setUserLists] = useState<BookList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | undefined>(undefined);
  const [isAddToListDialogOpen, setIsAddToListDialogOpen] = useState(false);
  const [isLogBookDialogOpen, setIsLogBookDialogOpen] = useState(false);
  const [userReview, setUserReview] = useState<ReviewType | null>(null); // For current user's review


  useEffect(() => {
    // Simulate fetching book and its user-specific data
    const foundBook = mockBooks.find((b) => b.id === params.id);
    if (foundBook) {
      setCurrentBook(JSON.parse(JSON.stringify(foundBook))); // Deep copy for local modifications
    }
    
    // Simulate fetching all reviews for the book
    const allBookReviews = mockReviews.filter((r) => r.bookId === params.id);
    setReviews(allBookReviews);

    // Find if the current user (u1) has a review for this book
    const currentUserReview = allBookReviews.find(r => r.userId === 'u1'); // Assuming 'u1' is current user
    setUserReview(currentUserReview || null);

    // Simulate fetching user's lists
    setUserLists(mockBookLists.filter(list => list.userId === 'u1')); 
  }, [params.id]);


  if (!currentBook) {
    return <div className="text-center py-10">Book not found.</div>;
  }

  const handleAddToList = () => {
    if (!selectedListId || !currentBook) {
      toast({ title: "Error", description: "Please select a list.", variant: "destructive" });
      return;
    }
    console.log(`Simulating adding book "${currentBook.title}" to list ID: ${selectedListId}`);
    toast({ title: "Book Added (Simulated)", description: `"${currentBook.title}" added to list.` });
    setIsAddToListDialogOpen(false);
    setSelectedListId(undefined);
  };

  const handleLogSaved = (logDetails: {
    rating?: number;
    isRead?: boolean;
    readDate?: string;
    reviewText?: string;
  }) => {
    setCurrentBook(prev => {
      if (!prev) return null;
      const updatedBook = {
        ...prev,
        userRating: logDetails.rating,
        isRead: logDetails.isRead,
        readDate: logDetails.readDate,
      };

      // Simulate updating or creating a review
      if (logDetails.isRead && logDetails.rating) {
        const newOrUpdatedReview: ReviewType = {
          id: userReview?.id || `review-${Date.now()}`,
          userId: 'u1', // Current user
          userName: 'Alice Wonderland', // Current user name
          userAvatarUrl: 'https://placehold.co/40x40.png',
          bookId: prev.id,
          rating: logDetails.rating,
          reviewText: logDetails.reviewText,
          createdAt: logDetails.readDate || new Date().toISOString(),
          likes: userReview?.likes || 0,
          isLikedByCurrentUser: userReview?.isLikedByCurrentUser || false,
        };
        setUserReview(newOrUpdatedReview);
        setReviews(prevReviews => {
          const otherReviews = prevReviews.filter(r => r.id !== newOrUpdatedReview.id);
          return [newOrUpdatedReview, ...otherReviews];
        });
      } else if (!logDetails.isRead && userReview) { 
        // If marked as unread and there was a review, remove it (or handle differently)
        setReviews(prevReviews => prevReviews.filter(r => r.id !== userReview.id));
        setUserReview(null);
      }
      
      return updatedBook;
    });
  };

  const toggleWantToRead = () => {
    setCurrentBook(prev => {
      if (!prev) return null;
      const newWantToReadState = !prev.isWantToRead;
      toast({ title: newWantToReadState ? "Added to Watchlist!" : "Removed from Watchlist", description: `"${prev.title}" ${newWantToReadState ? 'is now on your watchlist.' : 'is no longer on your watchlist.'}` });
      return { ...prev, isWantToRead: newWantToReadState };
    });
  };

  const toggleLikeBook = () => {
    setCurrentBook(prev => {
      if (!prev) return null;
      const newLikedState = !prev.isLikedByCurrentUser;
      toast({ title: newLikedState ? "Book Liked!" : "Book Unliked", description: `You ${newLikedState ? 'now like' : "no longer like"} "${prev.title}".` });
      return { ...prev, isLikedByCurrentUser: newLikedState };
    });
  };

  const handleLikeReview = (reviewId: string) => {
    setReviews(prevReviews => 
      prevReviews.map(r => 
        r.id === reviewId ? { ...r, likes: (r.likes || 0) + (r.isLikedByCurrentUser ? -1 : 1), isLikedByCurrentUser: !r.isLikedByCurrentUser } : r
      )
    );
    if (userReview && userReview.id === reviewId) {
      setUserReview(prev => prev ? {...prev, likes: (prev.likes || 0) + (prev.isLikedByCurrentUser ? -1 : 1), isLikedByCurrentUser: !prev.isLikedByCurrentUser } : null);
    }
  };
  
  const handleDeleteReview = () => {
    if (!userReview) return;
    // Simulate deleting review
    setReviews(prevReviews => prevReviews.filter(r => r.id !== userReview.id));
    setUserReview(null);
    setCurrentBook(prev => prev ? {...prev, userRating: undefined, isRead: false, readDate: undefined} : null); // Reset book specific log
    toast({title: "Review Deleted", description: "Your review has been removed."});
  };


  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Log Book Dialog */}
      {currentBook && (
        <LogBookDialog 
          book={currentBook} 
          isOpen={isLogBookDialogOpen} 
          onOpenChange={setIsLogBookDialogOpen}
          onLogSaved={handleLogSaved}
          existingReview={userReview}
        />
      )}

      <Card className="overflow-hidden shadow-xl rounded-lg">
        <div className="md:flex">
          <div className="md:w-1/3 relative aspect-[2/3] md:aspect-auto">
            <Image
              src={currentBook.coverImageUrl || 'https://placehold.co/300x450.png'}
              alt={`Cover of ${currentBook.title}`}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 font-headline text-primary">{currentBook.title}</h1>
              <p className="text-xl text-muted-foreground mb-1">by {currentBook.author}</p>
              {currentBook.publicationYear && <p className="text-sm text-muted-foreground mb-3">Published in {currentBook.publicationYear}</p>}
              
              <div className="flex items-center mb-1">
                {currentBook.averageRating && (
                  <>
                    <StarRating initialRating={currentBook.averageRating} readonly size={20} />
                    <span className="ml-2 text-md text-foreground">
                      {currentBook.averageRating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">({reviews.length} community ratings)</span>
                  </>
                )}
              </div>
              {currentBook.userRating && (
                <div className="flex items-center mb-4 text-sm">
                    <span className="mr-2 text-primary font-semibold">Your rating:</span>
                    <StarRating initialRating={currentBook.userRating} readonly size={18} color="hsl(var(--primary))"/>
                    <span className="ml-2 text-primary font-semibold">{currentBook.userRating.toFixed(1)}</span>
                </div>
              )}


              <div className="flex flex-wrap gap-2 mb-4">
                {currentBook.genres?.map((genre) => (
                  <Badge key={genre} variant="secondary" className="transition-colors hover:bg-accent hover:text-accent-foreground">{genre}</Badge>
                ))}
              </div>

              <p className="text-foreground/80 leading-relaxed mb-6">{currentBook.summary}</p>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <Button variant="default" className="transition-transform hover:scale-105" onClick={() => setIsLogBookDialogOpen(true)}>
                <BookOpenCheck className="mr-2 h-4 w-4" /> {currentBook.isRead ? "Edit Log / Review" : "Rate / Log"}
              </Button>
              <Button 
                variant={currentBook.isWantToRead ? "secondary" : "outline"} 
                className="transition-transform hover:scale-105"
                onClick={toggleWantToRead}
              >
                <Bookmark className="mr-2 h-4 w-4" /> {currentBook.isWantToRead ? "On Watchlist" : "Want to Read"}
              </Button>
               <Button 
                variant="outline" 
                size="icon" 
                className={`transition-transform hover:scale-105 ${currentBook.isLikedByCurrentUser ? 'text-red-500 hover:text-red-600 border-red-500 hover:border-red-600' : 'text-muted-foreground'}`}
                onClick={toggleLikeBook}
              >
                <Heart className={`h-4 w-4 ${currentBook.isLikedByCurrentUser ? 'fill-current' : ''}`} />
                <span className="sr-only">Like book</span>
              </Button>
              
              <Dialog open={isAddToListDialogOpen} onOpenChange={setIsAddToListDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="transition-transform hover:scale-105">
                    <ListPlus className="mr-2 h-4 w-4" /> Add to List
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add "{currentBook.title}" to a list</DialogTitle>
                    <DialogDescription>Select one of your lists.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {userLists.length > 0 ? (
                      <Select onValueChange={setSelectedListId} value={selectedListId}>
                        <SelectTrigger><SelectValue placeholder="Select a list" /></SelectTrigger>
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
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleAddToList} disabled={!selectedListId || userLists.length === 0}>Add to selected list</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="icon" className="transition-transform hover:scale-105">
                <Share2 className="h-4 w-4" /><span className="sr-only">Share</span>
              </Button>
            </div>
            {currentBook.isRead && currentBook.readDate && (
                 <p className="text-sm text-primary mt-3">
                    You read this on {format(new Date(currentBook.readDate), "MMMM d, yyyy")}.
                </p>
            )}
          </div>
        </div>
      </Card>

      <Separator />

      <section>
        <h2 className="text-2xl font-bold mb-4 font-headline">Reviews</h2>
        {/* Current User's Review Section (if exists) */}
        {userReview ? (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Review</CardTitle>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsLogBookDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDeleteReview}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StarRating initialRating={userReview.rating} readonly size={20} className="mb-2" />
              <p className="text-foreground/90 leading-relaxed">{userReview.reviewText}</p>
            </CardContent>
             <CardFooter className="text-xs text-muted-foreground">
              Posted on {format(new Date(userReview.createdAt), "MMMM d, yyyy")}
            </CardFooter>
          </Card>
        ) : (
          !currentBook.isRead && ( // Only show "Write a Review" if not read or no existing review
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                    <CardDescription>You need to log this book as "Read" to write a full review.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setIsLogBookDialogOpen(true)}>
                        <BookOpenCheck className="mr-2 h-4 w-4" /> Log Book to Review
                    </Button>
                </CardContent>
            </Card>
          )
        )}
        
        {/* Other Users' Reviews */}
        <div className="mt-6 space-y-6">
          {reviews.filter(r => r.userId !== 'u1').length > 0 ? ( // Filter out current user's review if displayed above
            reviews.filter(r => r.userId !== 'u1' || !userReview).map((review) => (
              <ReviewCard key={review.id} review={review} onLikeReview={handleLikeReview} onReplyToReview={() => { /* TODO */}} />
            ))
          ) : (
             !userReview && <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to write one!</p>
          )}
           {reviews.filter(r => r.userId !== 'u1').length === 0 && userReview && (
            <p className="text-muted-foreground text-center py-4">No other community reviews yet.</p>
           )}
        </div>
      </section>
    </div>
  );
}
