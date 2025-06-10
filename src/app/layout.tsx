
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, User, LogIn, Search, List, HomeIcon, Bell } from 'lucide-react';
import './globals.css';
import { Button } from '@/components/ui/button';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


function NotificationsDropdown() {
  // In a real app, notifications would be fetched dynamically
  const mockNotifications = [
    { id: '1', text: 'Bob liked your review of "The Great Gatsby".', time: '2h ago', user: { name: 'Bob', avatar: 'https://placehold.co/40x40.png' } },
    { id: '2', text: 'New books added to your "Sci-Fi Classics" list.', time: '1d ago', icon: <List className="h-4 w-4 text-primary" /> },
    { id: '3', text: 'Charlie started following you.', time: '3d ago', user: { name: 'Charlie', avatar: 'https://placehold.co/40x40.png' } },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {mockNotifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockNotifications.length > 0 ? (
          mockNotifications.map(notif => (
            <DropdownMenuItem key={notif.id} className="flex items-start gap-3 py-2.5 cursor-pointer">
              {notif.user ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={notif.user.avatar} alt={notif.user.name} />
                  <AvatarFallback>{notif.user.name.substring(0,1)}</AvatarFallback>
                </Avatar>
              ) : notif.icon ? (
                <span className="flex items-center justify-center h-8 w-8 bg-secondary rounded-full">
                  {notif.icon}
                </span>
              ) : <div className="h-8 w-8" /> }
              <div className="flex-1">
                <p className="text-sm leading-snug">{notif.text}</p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm text-primary hover:!bg-primary/10 cursor-pointer">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <span className="font-bold text-xl font-headline text-primary">LibroVision</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="text-foreground/70 transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/discover" className="text-foreground/70 transition-colors hover:text-foreground">
            Discover
          </Link>
          <Link href="/lists" className="text-foreground/70 transition-colors hover:text-foreground">
            My Lists
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <NotificationsDropdown />
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">
              <LogIn className="mr-2 h-4 w-4" /> Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8 bg-background">
      <div className="container text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LibroVision. All rights reserved.
      </div>
    </footer>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("min-h-screen bg-background font-body antialiased flex flex-col")}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
