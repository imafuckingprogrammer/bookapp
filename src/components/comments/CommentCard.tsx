
"use client";

import type { Comment } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, type FormEvent } from 'react';

interface CommentCardProps {
  comment: Comment;
  onLikeComment: (commentId: string, isReply?: boolean, parentCommentId?: string) => void;
  onAddReply: (commentId: string, replyText: string, isReplyToReply?: boolean, parentCommentId?: string) => void;
  indentLevel?: number;
  parentCommentId?: string; // To help manage likes/replies on nested replies
}

export function CommentCard({ 
  comment, 
  onLikeComment, 
  onAddReply, 
  indentLevel = 0, 
  parentCommentId // If this is a reply, parentCommentId is the ID of the comment it's replying to
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  const handleReplySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(comment.id, replyText, indentLevel > 0, parentCommentId || comment.id);
    setReplyText('');
    setShowReplyForm(false);
  };

  const currentCommentIsReply = indentLevel > 0;

  return (
    <Card 
      className={`mb-2 shadow-sm rounded-lg ${indentLevel === 0 ? 'bg-card' : 'bg-secondary/30'}`}
      style={{ marginLeft: indentLevel > 0 ? `${Math.min(indentLevel * 15, 60)}px` : '0px' }} // Cap max indent
    >
      <CardHeader className="flex flex-row items-start space-x-2 p-2.5">
        {indentLevel > 0 && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground mt-1 mr-0.5" />}
        <Avatar className="h-7 w-7">
          <AvatarImage src={comment.userAvatarUrl || `https://placehold.co/40x40.png`} alt={comment.userName} />
          <AvatarFallback>{comment.userName?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xs font-semibold">{comment.userName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{timeAgo}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2.5 pb-1.5 pt-0">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.text}</p>
      </CardContent>
      <CardFooter className="px-2.5 py-1.5 border-t flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-1">
            <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs px-1.5 py-1 ${comment.isLikedByCurrentUser ? 'text-primary hover:text-primary/90' : 'text-muted-foreground hover:text-primary'}`}
                onClick={() => onLikeComment(comment.id, currentCommentIsReply, parentCommentId)}
            >
                <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.isLikedByCurrentUser ? 'fill-current' : ''}`} /> {comment.likes || 0}
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-primary text-xs px-1.5 py-1"
                onClick={() => setShowReplyForm(!showReplyForm)}
            >
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Reply
            </Button>
            </div>
        </div>
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="w-full mt-2 space-y-1.5">
            <Textarea 
              placeholder={`Reply to ${comment.userName}...`} 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[50px] text-sm p-1.5"
            />
            <div className="flex justify-end space-x-1.5">
              <Button type="button" variant="ghost" size="xs" onClick={() => setShowReplyForm(false)}>Cancel</Button>
              <Button type="submit" size="xs">Post Reply</Button>
            </div>
          </form>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2.5 w-full space-y-2 pl-0">
            {comment.replies.map(reply => (
              <CommentCard 
                key={reply.id} 
                comment={reply} 
                onLikeComment={onLikeComment}
                onAddReply={onAddReply}
                indentLevel={indentLevel + 1}
                parentCommentId={comment.id} // The current comment becomes the parent for its replies
              />
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
