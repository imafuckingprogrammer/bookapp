import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ListCard } from '@/components/lists/ListCard';
import { mockBookLists } from '@/lib/mock-data';
import { PlusCircle } from 'lucide-react';

export default function ListsPage() {
  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline text-primary">My Book Lists</h1>
        <Link href="/lists/new">
          <Button className="transition-transform hover:scale-105">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New List
          </Button>
        </Link>
      </section>

      {mockBookLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBookLists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-lg shadow-sm">
          <p className="text-xl text-muted-foreground mb-4">You haven't created any lists yet.</p>
          <Link href="/lists/new">
            <Button size="lg" className="transition-transform hover:scale-105">
              Create Your First List
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
