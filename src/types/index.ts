export type Book = {
  id: string;
  title: string;
  author: string;
  coverImageUrl: string;
  summary: string;
  averageRating?: number;
  genres?: string[];
  publicationYear?: number;
  isbn?: string;
};

export type Review = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  bookId: string;
  rating: number; // 1-5 stars
  reviewText?: string;
  createdAt: string; // ISO date string
  likes?: number;
  comments?: Comment[];
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  text: string;
  createdAt: string; // ISO date string
};

export type BookList = {
  id: string;
  userId: string;
  userName: string; // Creator's name
  name: string;
  description?: string;
  books: Book[]; // Embed simplified book objects or just IDs
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  likes?: number;
};
