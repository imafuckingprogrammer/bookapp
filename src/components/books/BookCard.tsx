
import type { Book } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/button';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <Link href={`/books/${book.id}`} className="block group">
        <CardHeader className="p-0">
          <div className="aspect-[2/3] w-full relative">
            <Image
              src={book.coverImageUrl || 'https://placehold.co/300x450.png'}
              alt={`Cover of ${book.title}`}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/books/${book.id}`} className="block">
          <CardTitle className="text-lg font-headline leading-tight mb-1 hover:text-primary transition-colors">
            {book.title}
          </CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
        {typeof book.averageRating === 'number' && (
          <div className="flex items-center">
            <StarRating initialRating={book.averageRating} readonly size={16} />
            <span className="ml-2 text-xs text-muted-foreground">({book.averageRating.toFixed(1)})</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Link href={`/books/${book.id}`} className="w-full">
          <Button variant="outline" className="w-full transition-colors duration-200">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
