import type { BookList } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, BookOpenCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ListCardProps {
  list: BookList;
}

export function ListCard({ list }: ListCardProps) {
  const timeAgo = formatDistanceToNow(new Date(list.updatedAt), { addSuffix: true });
  const coverImages = list.books.slice(0, 4).map(book => book.coverImageUrl);

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <Link href={`/lists/${list.id}`} className="block">
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-headline leading-tight mb-1 hover:text-primary transition-colors">
            {list.name}
          </CardTitle>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={`https://placehold.co/40x40.png`} alt={list.userName} data-ai-hint="person face"/>
              <AvatarFallback>{list.userName.substring(0,1)}</AvatarFallback>
            </Avatar>
            <span>By {list.userName}</span>
            <span>&bull;</span>
            <span>Updated {timeAgo}</span>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        {list.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{list.description}</p>
        )}
        {coverImages.length > 0 && (
          <div className="grid grid-cols-4 gap-1 h-20 mb-3">
            {coverImages.map((src, index) => (
              <div key={index} className="relative aspect-[2/3] bg-muted rounded-sm overflow-hidden">
                <Image src={src} alt={`Book cover ${index+1}`} layout="fill" objectFit="cover" data-ai-hint="book abstract"/>
              </div>
            ))}
            {/* Fill remaining slots if less than 4 books */}
            {Array(Math.max(0, 4 - coverImages.length)).fill(0).map((_, idx) => (
              <div key={`placeholder-${idx}`} className="aspect-[2/3] bg-muted/50 rounded-sm"></div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
          <span className="flex items-center">
            <BookOpenCheck className="h-4 w-4 mr-1" /> {list.books.length} books
          </span>
          <span className="flex items-center">
            <Heart className="h-4 w-4 mr-1" /> {list.likes || 0} likes
          </span>
        </div>
        <Link href={`/lists/${list.id}`}>
          <Button variant="outline" size="sm" className="transition-colors duration-200">View List</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
