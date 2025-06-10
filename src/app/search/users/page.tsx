
"use client";
import { useState, type FormEvent } from 'react';
import type { UserProfile, PaginatedResponse } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, User as UserIcon, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { searchUsers } from '@/lib/services/userService';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';


function UserResultCard({ user }: { user: UserProfile }) {
  const { userProfile: currentUser } = useAuth();
  // In a real app, follow logic would call userService.followUser/unfollowUser
  // and update local state or re-fetch.
  const [isFollowing, setIsFollowing] = useState(user.is_current_user_following || false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUser || currentUser.id === user.id) return; // Cannot follow self
    setIsLoadingFollow(true);
    // try {
    //   if (isFollowing) await unfollowUser(user.id);
    //   else await followUser(user.id);
    //   setIsFollowing(!isFollowing);
    // } catch (error) {
    //   console.error("Failed to toggle follow:", error);
    //   // Show toast
    // } finally {
    //   setIsLoadingFollow(false);
    // }
    console.log(`Stub: Toggle follow for ${user.username}`);
    setIsFollowing(!isFollowing); // Simulate
    setIsLoadingFollow(false);
  };

  return (
    <div className="p-4 bg-card rounded-lg shadow flex items-center space-x-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Link href={`/profile/${user.username}`} className="hover:underline">
          <h3 className="font-semibold text-primary">{user.name || user.username}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
        {user.bio && <p className="text-xs text-foreground/80 mt-1 line-clamp-1">{user.bio}</p>}
      </div>
      {currentUser && currentUser.id !== user.id && (
        <Button 
          size="sm" 
          variant={isFollowing ? "secondary" : "default"}
          onClick={handleFollowToggle}
          disabled={isLoadingFollow}
        >
          {isLoadingFollow && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}


export default function SearchUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const handleSearch = async (e?: FormEvent, page: number = 1) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a name or username to search.");
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      const response: PaginatedResponse<UserProfile> = await searchUsers(searchQuery, page);
      setSearchResults(response.items);
      setTotalPages(response.totalPages);
      if (response.items.length === 0) {
        setError("No users found matching your query.");
      }
    } catch (err) {
      console.error("User search failed:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to search users: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 font-headline text-primary flex items-center"><Users className="mr-3 h-8 w-8" /> Find People</h1>
        <form onSubmit={(e) => handleSearch(e, 1)} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by username or name..." 
              className="pl-10 w-full" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && currentPage === 1 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Search
          </Button>
        </form>
      </section>

      {error && !isLoading && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Search Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <section>
        {isLoading && searchResults.length === 0 && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Searching for users...</p>
          </div>
        )}
        {!isLoading && searchResults.length > 0 && (
          <div className="space-y-4">
            {searchResults.map((user) => (
              <UserResultCard key={user.id} user={user} />
            ))}
          </div>
        )}
        {!isLoading && searchResults.length === 0 && searchQuery && !error && (
           <div className="text-center py-10 text-muted-foreground">
            <p>No users found for "{searchQuery}". Try a different search term.</p>
          </div>
        )}
         {!isLoading && searchResults.length === 0 && !searchQuery && !error && (
           <div className="text-center py-10 text-muted-foreground">
            <p>Enter a username or name above to find people.</p>
          </div>
        )}
      </section>

      {!isLoading && searchResults.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button 
            variant="outline" 
            onClick={() => handleSearch(undefined, currentPage - 1)} 
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
          <Button 
            variant="outline" 
            onClick={() => handleSearch(undefined, currentPage + 1)} 
            disabled={currentPage >= totalPages || isLoading}
          >
            {isLoading && currentPage < totalPages ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
