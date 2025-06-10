
"use client";

import type { Comment } from '@/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, type FormEvent } from 'react';

interface CommentCardProps {
  comment: Comment;
  onLikeComment: (commentId: string) => void;
  onAddReply: (commentId: string, replyText: string) => void;
  indentLevel?: number;
}

export function CommentCard({ comment, onLikeComment, onAddReply, indentLevel = 0 }: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

  const handleReplySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(comment.id, replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  return (
    <Card 
      className="mb-4 shadow-sm rounded-lg" 
      style={{ marginLeft: `${indentLevel * 20}px` }}
    >
      <CardHeader className="flex flex-row items-start space-x-3 p-3">
        {indentLevel > 0 && <CornerDownRight className="h-4 w-4 text-muted-foreground mt-1 mr-1" />}
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.userAvatarUrl || `https://placehold.co/40x40.png`} alt={comment.userName} />
          <AvatarFallback>{comment.userName?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold">{comment.userName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{timeAgo}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-2 pt-0">
        <p className="text-sm leading-relaxed">{comment.text}</p>
      </CardContent>
      <CardFooter className="px-3 py-2 border-t flex flex-col items-start">
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs px-2 py-1" onClick={() => onLikeComment(comment.id)}>
                <ThumbsUp className="h-3 w-3 mr-1" /> {comment.likes || 0}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-xs px-2 py-1" onClick={() => setShowReplyForm(!showReplyForm)}>
                <MessageSquare className="h-3 w-3 mr-1" /> Reply
            </Button>
            </div>
        </div>
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="w-full mt-2 space-y-2">
            <Textarea 
              placeholder={`Reply to ${comment.userName}...`} 
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
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 w-full space-y-3 pl-0">
            {comment.replies.map(reply => (
              <CommentCard 
                key={reply.id} 
                comment={reply} 
                onLikeComment={onLikeComment}
                onAddReply={onAddReply}
                indentLevel={indentLevel + 1}
              />
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
