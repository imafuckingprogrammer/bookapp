
import type { Review, Comment } from '@/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { CommentCard } from '../comments/CommentCard'; // Assuming CommentCard handles its own replies

interface ReviewCardProps {
  review: Review;
  onLikeReview: (reviewId: string) => void;
  // TODO: Add functionality for replying directly to a review if needed, 
  // or handle all comments through a unified system.
  onReplyToReview: (reviewId: string, replyText: string) => void; 
}

export function ReviewCard({ review, onLikeReview, onReplyToReview }: ReviewCardProps) {
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  // Local state for comments if a review itself can have direct comments/replies.
  // This might be redundant if `review.comments` is already part of a global/parent state.
  const [internalComments, setInternalComments] = useState<Comment[]>(review.comments || []);


  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    // This is a placeholder. In a real app, this would likely go to a backend
    // and update a global state or re-fetch.
    // For now, let's assume onReplyToReview handles the logic.
    onReplyToReview(review.id, replyText); 
    
    // Example of local update, if CommentCard isn't handling its own state completely
    const newComment: Comment = {
        id: `comment-${Date.now()}`,
        userId: 'currentUser_placeholder', 
        userName: 'Current User',
        userAvatarUrl: 'https://placehold.co/40x40.png',
        text: replyText,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: []
    };
    setInternalComments(prev => [...prev, newComment]);

    setReplyText('');
    setShowReplyForm(false);
  };
  
  // Dummy handlers for CommentCard's own like/reply if needed for deep nesting
  // These would ideally be bubbled up or handled by a context/global state
  const handleLikeNestedComment = (commentId: string) => {
    console.log(`Liking nested comment ${commentId} within review ${review.id} (simulated)`);
    setInternalComments(prevComments => 
        prevComments.map(c => 
            c.id === commentId ? {...c, likes: (c.likes || 0) + 1} : c // Simplified toggle
        )
    );
  };
  const handleAddReplyToNestedComment = (commentId: string, text: string) => {
     console.log(`Replying to nested comment ${commentId} within review ${review.id} with: ${text} (simulated)`);
  };


  return (
    <Card className="mb-4 shadow-md rounded-lg">
      <CardHeader className="flex flex-row items-start space-x-4 p-4">
        <Avatar>
          <AvatarImage src={review.userAvatarUrl || 'https://placehold.co/40x40.png'} alt={review.userName} />
          <AvatarFallback>{review.userName?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-md font-semibold">{review.userName}</CardTitle>
          <div className="flex items-center space-x-2">
            <StarRating initialRating={review.rating} readonly size={16} />
            <CardDescription className="text-xs text-muted-foreground">{timeAgo}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {review.reviewText && (
        <CardContent className="px-4 pb-2 pt-0">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.reviewText}</p>
        </CardContent>
      )}
      <CardFooter className="px-4 py-3 border-t flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-2">
            <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs px-2 py-1 ${review.isLikedByCurrentUser ? 'text-primary hover:text-primary/90' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => onLikeReview(review.id)}
            >
                <ThumbsUp className={`h-4 w-4 mr-1 ${review.isLikedByCurrentUser ? 'fill-current' : ''}`} /> {review.likes || 0}
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary text-xs px-2 py-1"
                onClick={() => setShowReplyForm(!showReplyForm)}
            >
                <MessageSquare className="h-4 w-4 mr-1" /> {(review.comments?.length || 0) + (internalComments.filter(ic => !review.comments?.find(rc => rc.id === ic.id)).length || 0)} Reply
            </Button>
            </div>
        </div>

        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="w-full mt-3 space-y-2">
            <Textarea 
              placeholder={`Reply to ${review.userName}'s review...`} 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>Cancel</Button>
              <Button type="submit" size="sm">Post Reply</Button>
            </div>
          </form>
        )}
        
        {/* Displaying comments associated with the review */}
        {internalComments.length > 0 && (
            <div className="mt-4 w-full space-y-3 pl-0 border-t pt-3">
                 <h4 className="text-xs font-semibold text-muted-foreground mb-1">Replies to this review:</h4>
                {internalComments.map(comment => (
                    <CommentCard 
                        key={comment.id} 
                        comment={comment}
                        // These handlers might need to be more sophisticated if review comments are managed globally
                        onLikeComment={handleLikeNestedComment} 
                        onAddReply={handleAddReplyToNestedComment}
                        indentLevel={1} 
                    />
                ))}
            </div>
        )}

      </CardFooter>
    </Card>
  );
}
