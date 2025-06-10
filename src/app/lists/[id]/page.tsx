import { mockBookLists, mockBooks } from '@/lib/mock-data';
import type { BookList as BookListType } from '@/types';
import { BookCard } from '@/components/books/BookCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, Edit3, Share2, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export async function generateStaticParams() {
  return mockBookLists.map((list) => ({
    id: list.id,
  }));
}

export default function ListDetailsPage({ params }: { params: { id: string } }) {
  const list = mockBookLists.find((l) => l.id === params.id);

  if (!list) {
    return <div className="text-center py-10">List not found.</div>;
  }

  const timeAgo = formatDistanceToNow(new Date(list.updatedAt), { addSuffix: true });

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 font-headline text-primary">{list.name}</h1>
            <div className="flex items-center space-x-2 text-md text-muted-foreground mb-3">
              <Avatar className="h-7 w-7">
                 <AvatarImage src={`https://placehold.co/40x40.png`} alt={list.userName}  />
                 <AvatarFallback>{list.userName.substring(0,1)}</AvatarFallback>
              </Avatar>
              <span>Created by {list.userName}</span>
              <span>&bull;</span>
              <span>Updated {timeAgo}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant="outline" className="transition-transform hover:scale-105">
              <Heart className="mr-2 h-4 w-4" /> Like ({list.likes || 0})
            </Button>
            <Button variant="outline" className="transition-transform hover:scale-105">
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" size="icon" className="transition-transform hover:scale-105">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share List</span>
            </Button>
          </div>
        </div>
        {list.description && <p className="text-lg text-foreground/80 mb-6">{list.description}</p>}
        
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-bold mb-6 font-headline">Books in this List ({list.books.length})</h2>
        {list.books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {list.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">This list is currently empty.</p>
        )}
      </section>

      <Separator />

      <section>
        <h2 className="text-2xl font-bold mb-4 font-headline">Comments</h2>
        {/* Placeholder for comments section */}
        <div className="bg-card p-6 rounded-lg shadow">
          <textarea
            placeholder="Write a comment..."
            className="w-full p-2 border border-input rounded-md min-h-[80px] focus:ring-primary focus:border-primary"
          />
          <div className="mt-2 text-right">
            <Button className="transition-transform hover:scale-105">
              <MessageCircle className="mr-2 h-4 w-4" /> Post Comment
            </Button>
          </div>
          <div className="mt-6 text-muted-foreground text-sm">
            No comments yet.
          </div>
        </div>
      </section>
    </div>
  );
}
