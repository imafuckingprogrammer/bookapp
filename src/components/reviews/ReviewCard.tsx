import type { Review } from '@/types';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';


export function ReviewCard({ review }: { review: Review }) {
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });

  return (
    <Card className="mb-4 shadow-md rounded-lg">
      <CardHeader className="flex flex-row items-start space-x-4 p-4">
        <Avatar>
          <AvatarImage src={review.userAvatarUrl} alt={review.userName} data-ai-hint="person face" />
          <AvatarFallback>{review.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
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
          <p className="text-sm leading-relaxed">{review.reviewText}</p>
        </CardContent>
      )}
      <CardFooter className="px-4 py-3 border-t flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <ThumbsUp className="h-4 w-4 mr-1" /> {review.likes || 0}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <MessageSquare className="h-4 w-4 mr-1" /> {review.comments?.length || 0}
          </Button>
        </div>
        <Button variant="link" size="sm" className="text-primary hover:underline">Reply</Button>
      </CardFooter>
    </Card>
  );
}
