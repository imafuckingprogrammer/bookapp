import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "@/components/books/BookCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ListCard } from "@/components/lists/ListCard";
import { mockBooks, mockReviews, mockBookLists } from "@/lib/mock-data";
import { Edit3, Settings, LogOut } from "lucide-react";

export default function ProfilePage() {
  // Placeholder user data
  const user = {
    name: "Alex Reader",
    username: "alexreads",
    avatarUrl: "https://placehold.co/128x128.png",
    bio: "Avid reader, aspiring writer. Always looking for the next great story.",
    joinDate: "Joined January 2023",
    stats: {
      booksRead: 125,
      reviewsWritten: 42,
      listsCreated: 5,
    },
  };

  const userBooksRead = mockBooks.slice(0, 3); // Example
  const userReviews = mockReviews.filter(r => r.userId === 'u1').slice(0,2); // Example, filter by current user
  const userLists = mockBookLists.filter(l => l.userId === 'u1'); // Example

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardHeader className="bg-gradient-to-br from-primary/20 via-background to-background p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
              <AvatarFallback className="text-4xl">{user.name.substring(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary">{user.name}</CardTitle>
              <CardDescription className="text-md text-muted-foreground">@{user.username}</CardDescription>
              <p className="text-sm text-muted-foreground mt-1">{user.joinDate}</p>
            </div>
            <div className="md:ml-auto flex space-x-2 pt-4 md:pt-0">
              <Button variant="outline" className="transition-transform hover:scale-105">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
              <Button variant="ghost" size="icon" className="transition-transform hover:scale-105">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </div>
          {user.bio && <p className="mt-4 text-center md:text-left text-foreground/80">{user.bio}</p>}
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center border-t">
          <div>
            <p className="text-2xl font-bold">{user.stats.booksRead}</p>
            <p className="text-sm text-muted-foreground">Books Read</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user.stats.reviewsWritten}</p>
            <p className="text-sm text-muted-foreground">Reviews Written</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{user.stats.listsCreated}</p>
            <p className="text-sm text-muted-foreground">Lists Created</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="books">Books Read</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="lists">Lists</TabsTrigger>
        </TabsList>
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Activity feed coming soon...</p>
              {/* Placeholder for activity items */}
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-secondary/30 rounded-md text-sm">Alex logged <span className="font-semibold text-primary">"The Great Gatsby"</span> as read.</div>
                <div className="p-3 bg-secondary/30 rounded-md text-sm">Alex rated <span className="font-semibold text-primary">"1984"</span> 5 stars.</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="books">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userBooksRead.map(book => <BookCard key={book.id} book={book} />)}
          </div>
          {userBooksRead.length === 0 && <p className="text-muted-foreground text-center py-8">No books logged yet.</p>}
        </TabsContent>
        <TabsContent value="reviews">
          <div className="space-y-6">
            {userReviews.map(review => <ReviewCard key={review.id} review={review} />)}
          </div>
          {userReviews.length === 0 && <p className="text-muted-foreground text-center py-8">No reviews written yet.</p>}
        </TabsContent>
        <TabsContent value="lists">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userLists.map(list => <ListCard key={list.id} list={list} />)}
          </div>
           {userLists.length === 0 && <p className="text-muted-foreground text-center py-8">No lists created yet.</p>}
        </TabsContent>
      </Tabs>
      <div className="text-center mt-12">
        <Button variant="destructive" className="transition-transform hover:scale-105">
          <LogOut className="mr-2 h-4 w-4"/> Log Out
        </Button>
      </div>
    </div>
  );
}
