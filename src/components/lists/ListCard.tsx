
import type { ListCollection } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThumbsUp, BookOpenCheck, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ListCardProps {
  list: ListCollection;
}

export function ListCard({ list }: ListCardProps) {
  const timeAgo = list.updated_at ? formatDistanceToNow(new Date(list.updated_at), { addSuffix: true }) : 'unknown';
  // Use pre-fetched cover_images if available, otherwise derive from books (if any)
  const coverImages = list.cover_images || list.books?.slice(0, 4).map(book => book.coverImageUrl || '') || [];

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <Link href={`/lists/${list.id}`} className="block group">
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-headline leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2" title={list.name}>
            {list.name}
          </CardTitle>
          {list.user && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src={list.user.avatar_url || `https://placehold.co/40x40.png`} alt={list.user.username} />
                <AvatarFallback>{list.user.username?.substring(0,1)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span>By {list.user.username}</span>
              <span>&bull;</span>
              <span>Updated {timeAgo}</span>
            </div>
          )}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {list.is_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span>{list.is_public ? 'Public' : 'Private'}</span>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        {list.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{list.description}</p>
        )}
        {coverImages.length > 0 ? (
          <div className={`grid ${coverImages.length === 1 ? 'grid-cols-1' : (coverImages.length === 2 ? 'grid-cols-2' : (coverImages.length === 3 ? 'grid-cols-3' : 'grid-cols-4'))} gap-1 h-28 md:h-24 mb-3`}>
            {coverImages.map((src, index) => (
              <div key={index} className="relative aspect-[2/3] bg-muted rounded-sm overflow-hidden shadow-inner">
                {src ? (
                    <Image src={src} alt={`Book cover ${index+1}`} layout="fill" objectFit="cover" />
                ) : (
                    <div className="w-full h-full bg-muted/50"></div> // Placeholder for missing image
                )}
              </div>
            ))}
            {/* Fill remaining slots if less than 4 books to maintain grid structure, hide if only 1 book */}
            {coverImages.length < 4 && coverImages.length > 1 && Array(4 - coverImages.length).fill(0).map((_, idx) => (
              <div key={`placeholder-${idx}`} className="aspect-[2/3] bg-muted/30 rounded-sm"></div>
            ))}
          </div>
        ) : (
          <div className="h-28 md:h-24 mb-3 flex items-center justify-center bg-muted/30 rounded-md">
            <BookOpenCheck className="w-10 h-10 text-muted-foreground/50" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
          <span className="flex items-center">
            <BookOpenCheck className="h-4 w-4 mr-1" /> {list.item_count || 0} {list.item_count === 1 ? "book" : "books"}
          </span>
          <span className={`flex items-center ${list.current_user_has_liked ? 'text-primary font-medium': ''}`}>
            <ThumbsUp className={`h-4 w-4 mr-1 ${list.current_user_has_liked ? 'fill-current' : ''}`} /> {list.like_count || 0}
          </span>
           {/* You might need to fetch comment count separately or include it in list data */}
           {/* <span className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" /> {list.comments?.length || 0} 
          </span> */}
        </div>
        <Link href={`/lists/${list.id}`}>
          <Button variant="outline" size="sm" className="transition-colors duration-200">View List</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
