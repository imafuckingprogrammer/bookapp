
"use client"; 

import Image from 'next/image';
import type { Book, Review as ReviewType, ListCollection, UserBookInteraction } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Heart, ListPlus, Share2, BookOpenCheck, Bookmark, Edit, Trash2, Library, Loader2, BookIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LogBookDialog } from '@/components/books/LogBookDialog';
import { format } from 'date-fns';
import { getBookDetails, getBookReviews, getUserBookInteraction, updateUserBookInteraction, likeBook, unlikeBook, addBookReview, deleteReview as deleteReviewService } from '@/lib/services/bookService';
import { getUserLists, addBookToList as addBookToListService } from '@/lib/services/listService'; // Assuming listService for user's lists
import { useAuth } from '@/contexts/AuthContext';
import { likeReview as likeReviewService, unlikeReview as unlikeReviewService } from '@/lib/services/reviewService';


export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const { userProfile, isAuthenticated } = useAuth();

  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [userInteraction, setUserInteraction] = useState<Partial<UserBookInteraction> | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [userLists, setUserLists] = useState<ListCollection[]>([]);
  
  const [selectedListId, setSelectedListId] = useState<string | undefined>(undefined);
  const [isAddToListDialogOpen, setIsAddToListDialogOpen] = useState(false);
  const [isLogBookDialogOpen, setIsLogBookDialogOpen] = useState(false);
  
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingInteraction, setIsLoadingInteraction] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookId = params.id;

  const fetchBookData = useCallback(async () => {
    setIsLoadingBook(true);
    setError(null);
    try {
      const bookData = await getBookDetails(bookId);
      if (!bookData) {
        setError("Book not found.");
        toast({ title: "Error", description: "Book not found.", variant: "destructive" });
        setCurrentBook(null);
        return;
      }
      setCurrentBook(bookData);
    } catch (err) {
      console.error("Failed to fetch book details:", err);
      setError("Could not load book details.");
      toast({ title: "Error", description: "Could not load book details.", variant: "destructive" });
    } finally {
      setIsLoadingBook(false);
    }
  }, [bookId, toast]);

  const fetchReviewsData = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const reviewsData = await getBookReviews(bookId);
      setReviews(reviewsData.items);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast({ title: "Error", description: "Could not load reviews.", variant: "destructive" });
    } finally {
      setIsLoadingReviews(false);
    }
  }, [bookId, toast]);

  const fetchUserInteractionData = useCallback(async () => {
    if (!isAuthenticated || !userProfile) {
      setUserInteraction(null); // Clear interaction if not authenticated
      setIsLoadingInteraction(false);
      return;
    }
    setIsLoadingInteraction(true);
    try {
      const interactionData = await getUserBookInteraction(bookId);
      setUserInteraction(interactionData);
    } catch (err) {
      console.error("Failed to fetch user interaction:", err);
      // Don't show toast for this, might be normal if no interaction yet
    } finally {
      setIsLoadingInteraction(false);
    }
  }, [bookId, isAuthenticated, userProfile]);

  useEffect(() => {
    fetchBookData();
    fetchReviewsData();
  }, [fetchBookData, fetchReviewsData]);
  
  useEffect(() => {
    fetchUserInteractionData();
  }, [fetchUserInteractionData]); // Depends on auth state

  useEffect(() => {
    if (isAuthenticated && isAddToListDialogOpen) {
      getUserLists(userProfile!.id) // Assuming userProfile.id is the current user's ID
        .then(data => setUserLists(data.items))
        .catch(err => {
          console.error("Failed to fetch user lists:", err);
          toast({ title: "Error", description: "Could not load your lists.", variant: "destructive"});
        });
    }
  }, [isAuthenticated, userProfile, isAddToListDialogOpen, toast]);

  const handleUpdateInteraction = async (interactionUpdate: Partial<Omit<UserBookInteraction, 'user_id' | 'book_id'>>) => {
    if (!isAuthenticated || !currentBook) {
      toast({ title: "Login Required", description: "Please login to perform this action.", variant: "destructive" });
      return;
    }
    try {
      const updated = await updateUserBookInteraction(currentBook.id, interactionUpdate);
      setUserInteraction(updated); // Update local state with the full interaction object from backend
      
      // Update specific fields on currentBook for immediate UI reflection if they are part of it
      // This part might be removed if UserBookInteraction is the sole source of truth for these
      setCurrentBook(prev => prev ? {
        ...prev,
        currentUserRating: updated.rating ?? prev.currentUserRating,
        currentUserIsRead: updated.is_read ?? prev.currentUserIsRead,
        currentUserReadDate: updated.read_date ?? prev.currentUserReadDate,
      } : null);

    } catch (error) {
      console.error("Failed to update interaction", error);
      toast({ title: "Error", description: "Could not save your changes.", variant: "destructive" });
    }
  };


  const handleAddToList = async () => {
    if (!selectedListId || !currentBook || !isAuthenticated) {
      toast({ title: "Error", description: "Please select a list or login.", variant: "destructive" });
      return;
    }
    try {
      await addBookToListService(selectedListId, currentBook.id);
      toast({ title: "Book Added", description: `"${currentBook.title}" added to list.` });
      setIsAddToListDialogOpen(false);
      setSelectedListId(undefined);
    } catch (error) {
      console.error("Failed to add book to list", error);
      toast({ title: "Error", description: "Could not add book to list.", variant: "destructive" });
    }
  };

  const handleLogSaved = async (logDetails: {
    rating?: number;
    isRead?: boolean;
    readDate?: string;
    reviewText?: string;
  }) => {
    if (!isAuthenticated || !currentBook) return;

    // Update interaction (rating, isRead, readDate)
    await handleUpdateInteraction({
        rating: logDetails.rating,
        is_read: logDetails.isRead,
        read_date: logDetails.readDate,
        log_notes: !logDetails.reviewText && logDetails.isRead ? "Logged as read" : undefined, // Example log note
    });
    
    // Handle review (create, update, or delete)
    const existingUserReview = reviews.find(r => r.user_id === userProfile?.id);

    if (logDetails.isRead && logDetails.rating && logDetails.reviewText) { // Create or Update review
        try {
            // This is simplified. Real app needs to differentiate create vs update.
            // For now, let's assume it creates. An update would need reviewService.updateReview(existingUserReview.id, ...)
            const newOrUpdatedReview = await addBookReview(currentBook.id, logDetails.rating, logDetails.reviewText);
            // Re-fetch reviews to see the new/updated one
            fetchReviewsData(); 
            toast({ title: "Review Saved!", description: "Your review has been published." });
        } catch (error) {
            console.error("Failed to save review", error);
            toast({ title: "Error", description: "Could not save your review.", variant: "destructive" });
        }
    } else if (!logDetails.isRead && existingUserReview) { // Delete review if marked as not read
        try {
            await deleteReviewService(existingUserReview.id);
            fetchReviewsData(); // Re-fetch
            toast({ title: "Review Deleted", description: "Your review was removed as the book is no longer marked as read." });
        } catch (error) {
             console.error("Failed to delete review", error);
             toast({ title: "Error", description: "Could not delete your review.", variant: "destructive" });
        }
    }
     // After saving, re-fetch user interaction to ensure consistency
    fetchUserInteractionData();
  };
  
  const toggleWantToRead = async () => {
    if (!isAuthenticated || !currentBook) return;
    const newWantToReadState = !userInteraction?.is_on_watchlist;
    await handleUpdateInteraction({ is_on_watchlist: newWantToReadState });
    toast({ title: newWantToReadState ? "Added to Watchlist!" : "Removed from Watchlist" });
  };

  const toggleLikeBook = async () => {
    if (!isAuthenticated || !currentBook) return;
    const newLikedState = !userInteraction?.is_liked;
    try {
        if(newLikedState) await likeBook(currentBook.id); else await unlikeBook(currentBook.id);
        await handleUpdateInteraction({ is_liked: newLikedState }); // This updates local state
        toast({ title: newLikedState ? "Book Liked!" : "Book Unliked" });
    } catch (error) {
        console.error("Failed to toggle book like", error);
        toast({ title: "Error", description: "Action failed.", variant: "destructive" });
    }
  };
  
  const toggleOwnedBook = async () => {
    if (!isAuthenticated || !currentBook) return;
    const newOwnedState = !userInteraction?.is_owned;
    await handleUpdateInteraction({ is_owned: newOwnedState });
    toast({ title: newOwnedState ? "Marked as Owned!" : "Marked as Not Owned" });
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!isAuthenticated) return;
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const newLikedState = !review.current_user_has_liked;
    try {
        if (newLikedState) await likeReviewService(reviewId);
        else await unlikeReviewService(reviewId);
        
        // Optimistic update for UI, then re-fetch or rely on service to return updated review
        setReviews(prevReviews => 
          prevReviews.map(r => 
            r.id === reviewId ? { 
                ...r, 
                like_count: (r.like_count || 0) + (newLikedState ? 1 : -1), 
                current_user_has_liked: newLikedState 
            } : r
          )
        );
        // fetchReviewsData(); // Or update just one review based on API response
    } catch (error) {
        console.error("Failed to like/unlike review", error);
        toast({ title: "Error", description: "Could not update like status.", variant: "destructive" });
    }
  };
  
  const handleDeleteUserReview = async () => {
    if (!isAuthenticated || !userProfile) return;
    const userReview = reviews.find(r => r.user_id === userProfile.id);
    if (!userReview) return;

    try {
        await deleteReviewService(userReview.id);
        fetchReviewsData(); // Re-fetch reviews
        // Also clear related interaction fields if necessary, or re-fetch interaction
        await handleUpdateInteraction({ rating: undefined, review_id: undefined /* if you track review_id in interaction */ });
        toast({title: "Review Deleted", description: "Your review has been removed."});
    } catch (error) {
        console.error("Failed to delete review", error);
        toast({title: "Error", description: "Could not delete your review.", variant: "destructive"});
    }
  };

  if (isLoadingBook || isLoadingInteraction) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">{error}</div>;
  }
  
  if (!currentBook) {
    return <div className="text-center py-10">Book not found or could not be loaded.</div>;
  }
  
  const currentUserReview = reviews.find(r => r.user_id === userProfile?.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {isAuthenticated && (
        <LogBookDialog 
          book={currentBook} 
          isOpen={isLogBookDialogOpen} 
          onOpenChange={setIsLogBookDialogOpen}
          onLogSaved={handleLogSaved}
          existingReview={currentUserReview}
          initialInteraction={userInteraction || {}} // Pass current interaction state
        />
      )}

      <Card className="overflow-hidden shadow-xl rounded-lg">
        <div className="md:flex">
          <div className="md:w-1/3 relative aspect-[2/3] bg-muted flex items-center justify-center">
            {currentBook.coverImageUrl ? (
                <Image
                src={currentBook.coverImageUrl}
                alt={`Cover of ${currentBook.title}`}
                layout="fill"
                objectFit="cover"
                />
            ) : (
                <BookIcon className="w-1/2 h-1/2 text-muted-foreground/50" />
            )}
             {userInteraction?.is_owned && (
              <Badge variant="default" className="absolute top-2 left-2 shadow-lg">Owned</Badge>
            )}
          </div>
          <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 font-headline text-primary">{currentBook.title}</h1>
              <p className="text-xl text-muted-foreground mb-1">by {currentBook.author}</p>
              {currentBook.publicationYear && <p className="text-sm text-muted-foreground mb-3">Published in {currentBook.publicationYear}</p>}
              
              <div className="flex items-center mb-1">
                {currentBook.averageRating && currentBook.averageRating > 0 && (
                  <>
                    <StarRating initialRating={currentBook.averageRating} readonly size={20} />
                    <span className="ml-2 text-md text-foreground">
                      {currentBook.averageRating.toFixed(1)}
                    </span>
                    {/* TODO: Fetch review count for the book for community ratings */}
                    {/* <span className="ml-1 text-xs text-muted-foreground">({reviews.length} community ratings)</span> */}
                  </>
                )}
              </div>
              {isAuthenticated && userInteraction?.rating && (
                <div className="flex items-center mb-4 text-sm">
                    <span className="mr-2 text-primary font-semibold">Your rating:</span>
                    <StarRating initialRating={userInteraction.rating} readonly size={18} color="hsl(var(--primary))"/>
                    <span className="ml-2 text-primary font-semibold">{userInteraction.rating.toFixed(1)}</span>
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
              {isAuthenticated ? (
                <>
                <Button variant="default" className="transition-transform hover:scale-105" onClick={() => setIsLogBookDialogOpen(true)}>
                    <BookOpenCheck className="mr-2 h-4 w-4" /> {userInteraction?.is_read ? "Edit Log / Review" : "Rate / Log"}
                </Button>
                <Button 
                    variant={userInteraction?.is_on_watchlist ? "secondary" : "outline"} 
                    className="transition-transform hover:scale-105"
                    onClick={toggleWantToRead}
                >
                    <Bookmark className="mr-2 h-4 w-4" /> {userInteraction?.is_on_watchlist ? "On Watchlist" : "Want to Read"}
                </Button>
                <Button 
                    variant={userInteraction?.is_owned ? "secondary" : "outline"} 
                    className="transition-transform hover:scale-105"
                    onClick={toggleOwnedBook}
                >
                    <Library className="mr-2 h-4 w-4" /> {userInteraction?.is_owned ? "Owned" : "Mark as Owned"}
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className={`transition-transform hover:scale-105 ${userInteraction?.is_liked ? 'text-red-500 hover:text-red-600 border-red-500 hover:border-red-600' : 'text-muted-foreground'}`}
                    onClick={toggleLikeBook}
                    title={userInteraction?.is_liked ? "Unlike book" : "Like book"}
                >
                    <Heart className={`h-4 w-4 ${userInteraction?.is_liked ? 'fill-current' : ''}`} />
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
                                <SelectItem key={list.id} value={list.id}>{list.name} ({list.item_count || 0} books)</SelectItem>
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
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary hover:underline">Log in</Link> to rate, review, and track this book.
                </p>
              )}

              <Button variant="outline" size="icon" className="transition-transform hover:scale-105" title="Share (not implemented)">
                <Share2 className="h-4 w-4" /><span className="sr-only">Share</span>
              </Button>
            </div>
            {isAuthenticated && userInteraction?.is_read && userInteraction.read_date && (
                 <p className="text-sm text-primary mt-3">
                    You read this on {format(new Date(userInteraction.read_date), "MMMM d, yyyy")}.
                </p>
            )}
          </div>
        </div>
      </Card>

      <Separator />

      <section>
        <h2 className="text-2xl font-bold mb-4 font-headline">Reviews</h2>
        {isLoadingReviews ? (
            <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
            <>
            {isAuthenticated && currentUserReview ? (
            <Card className="mb-6 border-primary bg-primary/5">
                <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Your Review</CardTitle>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setIsLogBookDialogOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteUserReview}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <StarRating initialRating={currentUserReview.rating} readonly size={20} className="mb-2" />
                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{currentUserReview.review_text}</p>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                Posted on {format(new Date(currentUserReview.created_at), "MMMM d, yyyy")}
                </CardFooter>
            </Card>
            ) : isAuthenticated && userInteraction?.is_read && ( 
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                    <CardDescription>You've read this book. Share your thoughts!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setIsLogBookDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Write Your Review
                    </Button>
                </CardContent>
            </Card>
            )}
            
            <div className="mt-6 space-y-6">
            {reviews.filter(r => r.user_id !== userProfile?.id).length > 0 ? ( 
                reviews.filter(r => r.user_id !== userProfile?.id).map((review) => (
                <ReviewCard key={review.id} review={review} onLikeReview={handleLikeReview} onReplyToReview={(reviewId, text) => console.log("Reply to review (stub):", reviewId, text)} />
                ))
            ) : (
                !currentUserReview && <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first to write one!</p>
            )}
            {reviews.filter(r => r.user_id !== userProfile?.id).length === 0 && currentUserReview && (
                <p className="text-muted-foreground text-center py-4">No other community reviews yet.</p>
            )}
            </div>
            </>
        )}
      </section>
    </div>
  );
}
