
export type Book = {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  summary: string;
  averageRating?: number; // Overall average rating
  genres?: string[];
  publicationYear?: number;
  isbn?: string;

  // User-specific properties (simulated)
  userRating?: number; // Current user's rating for this book
  isRead?: boolean; // Has the current user read this book?
  readDate?: string; // ISO date string when the user read it
  isWantToRead?: boolean; // Is this book on the current user's watchlist?
  isLikedByCurrentUser?: boolean; // Has the current user liked this book?
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  bookId: string;
  rating: number; // User's rating associated with this review
  reviewText?: string;
  createdAt: string; // ISO date string
  likes?: number;
  comments?: Comment[];
  isLikedByCurrentUser?: boolean; // Has the current logged-in user liked this review?
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
  createdAt: string; // ISO date string
  likes?: number;
  replies?: Comment[];
  isLikedByCurrentUser?: boolean; // Has the current logged-in user liked this comment?
};

export type BookList = {
  id: string;
  userId: string;
  userName: string; // Creator's name
  userAvatarUrl?: string; // Added for consistency
  name: string;
  description?: string;
  books: Book[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  likes?: number;
  isPublic: boolean;
  comments?: Comment[];
  isLikedByCurrentUser?: boolean; // Has the current logged-in user liked this list?
};

// Represents an entry in the user's reading diary
export type DiaryEntry = {
  bookId: string;
  bookTitle: string; // Denormalized for easier display
  bookCoverImageUrl?: string; // Denormalized
  readDate: string; // ISO date string
  rating?: number; // Rating given at the time of logging
  reviewId?: string; // Optional link to a full review
  logNotes?: string; // Short notes for the diary entry, if not a full review
};
