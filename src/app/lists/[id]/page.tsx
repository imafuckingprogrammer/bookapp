
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { mockBookLists, mockBooks } from '@/lib/mock-data';
import type { BookList as BookListType, Book, Comment } from '@/types';
import { BookCard } from '@/components/books/BookCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Edit3, Share2, MessageCircle, Eye, EyeOff, ArrowDownAZ, ArrowUpAZ, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentCard } from '@/components/comments/CommentCard';
import { useToast } from '@/hooks/use-toast';

export default function ListDetailsPage({ params }: { params: { id:string } }) {
  const { toast } = useToast();
  const [listData, setListData] = useState<BookListType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sortedBooks, setSortedBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Simulate fetching list data
    const foundList = mockBookLists.find((l) => l.id === params.id);
    if (foundList) {
      // Deep copy to allow local modifications without affecting mock source
      setListData(JSON.parse(JSON.stringify(foundList))); 
      setSortedBooks(JSON.parse(JSON.stringify(foundList.books)));
    }
    setIsLoading(false);
  }, [params.id]);

  if (isLoading) {
    return <div className="text-center py-10">Loading list...</div>;
  }

  if (!listData) {
    return <div className="text-center py-10">List not found.</div>;
  }

  const timeAgo = formatDistanceToNow(new Date(listData.updatedAt), { addSuffix: true });

  const handleLikeList = () => {
    setListData(prev => {
      if (!prev) return null;
      const newLikedState = !prev.isLikedByCurrentUser;
      const newLikesCount = (prev.likes || 0) + (newLikedState ? 1 : -1);
      toast({ title: newLikedState ? "List Liked!" : "List Unliked" });
      return { 
        ...prev, 
        likes: newLikesCount < 0 ? 0 : newLikesCount, // Ensure likes don't go negative
        isLikedByCurrentUser: newLikedState, 
        updatedAt: new Date().toISOString() 
      };
    });
  };

  const handleTogglePrivacy = () => {
    setListData(prev => {
      if (!prev) return null;
      const newIsPublic = !prev.isPublic;
      toast({ title: `List is now ${newIsPublic ? 'Public' : 'Private'}` });
      return { ...prev, isPublic: newIsPublic, updatedAt: new Date().toISOString() };
    });
  };
  
  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !listData) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}-${listData.id}`,
      userId: 'u1', // Placeholder for current user
      userName: 'Alice Wonderland', // Placeholder
      userAvatarUrl: 'https://placehold.co/40x40.png',
      text: commentText,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLikedByCurrentUser: false,
      replies: []
    };
    setListData(prev => prev ? { ...prev, comments: [newComment, ...(prev.comments || [])], updatedAt: new Date().toISOString() } : null);
    setCommentText('');
    toast({ title: "Comment posted!"});
  };

  const handleLikeOrReplyComment = (
    commentId: string, 
    action: 'like' | 'reply', 
    replyText?: string,
    isReply?: boolean, // Is the target comment itself a reply?
    parentCommentId?: string // If target is a reply, this is its parent's ID
  ) => {
    setListData(prev => {
      if (!prev || !prev.comments) return prev;

      const updateRecursive = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
          if (c.id === commentId) { // Found the target comment/reply
            if (action === 'like') {
              const newLikedState = !c.isLikedByCurrentUser;
              const newLikesCount = (c.likes || 0) + (newLikedState ? 1 : -1);
              return { ...c, likes: newLikesCount < 0 ? 0 : newLikesCount, isLikedByCurrentUser: newLikedState };
            } else if (action === 'reply' && replyText) {
              const newReply: Comment = {
                id: `reply-${Date.now()}-${commentId}`,
                userId: 'u1', userName: 'Alice Wonderland', userAvatarUrl: 'https://placehold.co/40x40.png',
                text: replyText, createdAt: new Date().toISOString(), likes: 0, isLikedByCurrentUser: false, replies: []
              };
              return { ...c, replies: [newReply, ...(c.replies || [])] };
            }
          }
          // If not the target, check its replies
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateRecursive(c.replies) };
          }
          return c;
        });
      };
      
      const updatedComments = updateRecursive(prev.comments);
      return { ...prev, comments: updatedComments, updatedAt: new Date().toISOString() };
    });

    if (action === 'like') toast({ title: "Interaction updated!" });
    if (action === 'reply') toast({ title: "Reply posted!" });
  };


  const sortBooksByTitle = (ascending = true) => {
    const sorted = [...sortedBooks].sort((a, b) => {
      if (ascending) return a.title.localeCompare(b.title);
      return b.title.localeCompare(a.title);
    });
    setSortedBooks(sorted);
  };


  return (
    <div className="space-y-8">
      <Card className="bg-card p-6 md:p-8 rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-headline text-primary">{listData.name}</h1>
            <div className="flex items-center space-x-2 text-md text-muted-foreground mb-1">
              <Avatar className="h-7 w-7">
                 <AvatarImage src={listData.userAvatarUrl || `https://placehold.co/40x40.png`} alt={listData.userName}  />
                 <AvatarFallback>{listData.userName?.substring(0,1)?.toUpperCase() || 'L'}</AvatarFallback>
              </Avatar>
              <span>Created by {listData.userName}</span>
              <span>&bull;</span>
              <span>Updated {timeAgo}</span>
            </div>
             <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                {listData.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>{listData.isPublic ? 'Public List' : 'Private List'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button 
                variant="outline" 
                className={`transition-transform hover:scale-105 ${listData.isLikedByCurrentUser ? 'text-primary border-primary' : ''}`} 
                onClick={handleLikeList}
            >
              <ThumbsUp className={`mr-2 h-4 w-4 ${listData.isLikedByCurrentUser ? 'fill-current' : ''}`} /> Like ({listData.likes || 0})
            </Button>
            <div className="flex items-center space-x-2 border p-2 rounded-md">
                <Switch id="privacy-toggle" checked={listData.isPublic} onCheckedChange={handleTogglePrivacy} />
                <Label htmlFor="privacy-toggle" className="text-sm cursor-pointer">Public</Label>
            </div>
            <Button variant="outline" size="icon" className="transition-transform hover:scale-105">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share List</span>
            </Button>
          </div>
        </div>
        {listData.description && <p className="text-lg text-foreground/80 mb-6">{listData.description}</p>}
        
      </Card>

      <Separator />

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-headline">Books in this List ({sortedBooks.length})</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => sortBooksByTitle(true)}><ArrowDownAZ className="mr-2 h-4 w-4" />Title A-Z</Button>
            <Button variant="outline" size="sm" onClick={() => sortBooksByTitle(false)}><ArrowUpAZ className="mr-2 h-4 w-4" />Title Z-A</Button>
          </div>
        </div>
        {sortedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">This list is currently empty.</p>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-bold mb-4 font-headline">Comments ({listData.comments?.length || 0})</h2>
        <Card className="shadow">
            <CardHeader>
                <CardTitle>Leave a Comment</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddComment} className="space-y-3">
                    <Textarea
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <Button type="submit" className="transition-transform hover:scale-105">
                        <MessageCircle className="mr-2 h-4 w-4" /> Post Comment
                    </Button>
                </form>
            </CardContent>
        </Card>
        <div className="mt-6 space-y-4">
          {(listData.comments && listData.comments.length > 0) ? (
            listData.comments.map((comment) => (
              <CommentCard 
                key={comment.id} 
                comment={comment} 
                onLikeComment={(commentId, isReply, parentCommentId) => handleLikeOrReplyComment(commentId, 'like', undefined, isReply, parentCommentId)}
                onAddReply={(commentId, text, isReplyToReply, parentCommentId) => handleLikeOrReplyComment(commentId, 'reply', text, isReplyToReply, parentCommentId)}
              />
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
      </section>
    </div>
  );
}
