
"use client"; // Required for useState, useEffect, and Tabs

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "@/components/books/BookCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ListCard } from "@/components/lists/ListCard";
import { mockBooks, mockReviews, mockBookLists, mockUserDiary, mockUserWatchlist, mockUserLikedBooks } from "@/lib/mock-data";
import type { Book, Review, BookList, DiaryEntry } from '@/types';
import { Edit3, Settings, LogOut, CalendarDays, Eye, Heart as HeartIcon } from "lucide-react";
import { format } from 'date-fns';
import Link from 'next/link';

// Placeholder user data - in a real app, this would come from auth/DB
const MOCK_USER_ID = 'u1';
const MOCK_USER_NAME = 'Alice Wonderland';

export default function ProfilePage() {
  // Simulate fetching data for the current user
  const [user, setUser] = useState({
    name: MOCK_USER_NAME,
    username: "alicereads",
    avatarUrl: "https://placehold.co/128x128.png",
    bio: "Avid reader, aspiring writer. Always looking for the next great story.",
    joinDate: "Joined January 2023",
  });

  const [userDiary, setUserDiary] = useState<DiaryEntry[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userLists, setUserLists] = useState<BookList[]>([]);
  const [userWatchlist, setUserWatchlist] = useState<Book[]>([]);
  const [userLikedBooks, setUserLikedBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Simulate fetching user-specific data
    setUserDiary(mockUserDiary.filter(entry => mockBooks.find(b => b.id === entry.bookId))); // Filter out entries for non-existent books
    setUserReviews(mockReviews.filter(r => r.userId === MOCK_USER_ID));
    setUserLists(mockBookLists.filter(l => l.userId === MOCK_USER_ID));
    setUserWatchlist(mockUserWatchlist);
    setUserLikedBooks(mockUserLikedBooks);
  }, []);

  const stats = {
    booksRead: userDiary.length,
    reviewsWritten: userReviews.length,
    listsCreated: userLists.length,
    booksOnWatchlist: userWatchlist.length,
    booksLiked: userLikedBooks.length,
  };

  const handleLikeReview = (reviewId: string) => {
    // This is a local simulation. In a real app, this would be an API call.
    setUserReviews(prevReviews => 
      prevReviews.map(r => 
        r.id === reviewId ? { ...r, likes: (r.likes || 0) + (r.isLikedByCurrentUser ? -1 : 1), isLikedByCurrentUser: !r.isLikedByCurrentUser } : r
      )
    );
  };
  const handleReplyToReview = (reviewId: string, replyText: string) => {
    console.log("Replying to review (simulated):", reviewId, replyText);
    // Add reply logic if review comments are managed here
  };


  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardHeader className="bg-gradient-to-br from-primary/20 via-background to-background p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name?.substring(0, 1)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary">{user.name}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">@{user.username}</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">{user.joinDate}</p>
            </div>
            <div className="md:ml-auto flex space-x-2 pt-4 md:pt-0">
              <Button variant="outline" className="transition-transform hover:scale-105">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
              <Button variant="ghost" size="icon" className="transition-transform hover:scale-105">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </div>
          {user.bio && <p className="mt-4 text-center md:text-left text-foreground/80">{user.bio}</p>}
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center border-t">
          <div>
            <p className="text-xl font-bold">{stats.booksRead}</p>
            <p className="text-xs text-muted-foreground">Read</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.reviewsWritten}</p>
            <p className="text-xs text-muted-foreground">Reviews</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.listsCreated}</p>
            <p className="text-xs text-muted-foreground">Lists</p>
          </div>
           <div>
            <p className="text-xl font-bold">{stats.booksOnWatchlist}</p>
            <p className="text-xs text-muted-foreground">Watchlist</p>
          </div>
           <div>
            <p className="text-xl font-bold">{stats.booksLiked}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="diary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
          <TabsTrigger value="diary">Diary</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>

        <TabsContent value="diary">
            <Card>
                <CardHeader><CardTitle>Reading Diary ({userDiary.length})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                {userDiary.length > 0 ? userDiary.map(entry => {
                    const book = mockBooks.find(b => b.id === entry.bookId); // Get full book details
                    return (
                    <Card key={entry.bookId + entry.readDate} className="flex items-start space-x-4 p-4 shadow-sm">
                        {book?.coverImageUrl && (
                        <Link href={`/books/${book.id}`} className="block shrink-0">
                            <Image src={book.coverImageUrl} alt={book.title} width={60} height={90} className="rounded-sm object-cover aspect-[2/3]" />
                        </Link>
                        )}
                        <div className="flex-grow">
                        <Link href={`/books/${book?.id || '#'}`} className="hover:underline">
                            <h3 className="font-semibold text-lg text-primary">{entry.bookTitle}</h3>
                        </Link>
                        {entry.rating && <StarRating initialRating={entry.rating} readonly size={16} className="my-1" />}
                        <p className="text-sm text-muted-foreground flex items-center">
                            <CalendarDays className="h-4 w-4 mr-1.5" /> Logged on {format(new Date(entry.readDate), "MMMM d, yyyy")}
                        </p>
                        {entry.logNotes && <p className="text-sm mt-1 italic text-foreground/80">"{entry.logNotes}"</p>}
                        {entry.reviewId && (
                             <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1">
                                <Link href={`/books/${entry.bookId}#review-${entry.reviewId}`}>View full review</Link>
                             </Button>
                        )}
                        </div>
                    </Card>
                    );
                }) : <p className="text-muted-foreground text-center py-8">No books logged in your diary yet.</p>}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="space-y-6">
            {userReviews.map(review => <ReviewCard key={review.id} review={review} onLikeReview={handleLikeReview} onReplyToReview={handleReplyToReview} />)}
          </div>
          {userReviews.length === 0 && <p className="text-muted-foreground text-center py-8">No reviews written yet.</p>}
        </TabsContent>

        <TabsContent value="lists">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userLists.map(list => <ListCard key={list.id} list={list} />)}
          </div>
           {userLists.length === 0 && <p className="text-muted-foreground text-center py-8">No lists created yet.</p>}
        </TabsContent>

        <TabsContent value="watchlist">
            <Card>
                <CardHeader><CardTitle>Watchlist ({userWatchlist.length})</CardTitle></CardHeader>
                <CardContent>
                    {userWatchlist.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {userWatchlist.map(book => <BookCard key={book.id} book={book} />)}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Your watchlist is empty. <Link href="/discover" className="text-primary hover:underline">Discover some books</Link>!</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="likes">
             <Card>
                <CardHeader><CardTitle>Liked Books ({userLikedBooks.length})</CardTitle></CardHeader>
                <CardContent>
                    {userLikedBooks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {userLikedBooks.map(book => <BookCard key={book.id} book={book} />)}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You haven't liked any books yet.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
      <div className="text-center mt-12">
        <Button variant="destructive" className="transition-transform hover:scale-105">
          <LogOut className="mr-2 h-4 w-4"/> Log Out
        </Button>
      </div>
    </div>
  );
}
