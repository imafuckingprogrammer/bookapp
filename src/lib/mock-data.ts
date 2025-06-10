
import type { Book, Review, BookList, Comment } from '@/types';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverImageUrl: 'https://placehold.co/300x450.png',
    summary: 'A story about the American dream and its decay, set in the Roaring Twenties.',
    averageRating: 4.5,
    genres: ['Classic', 'Fiction'],
    publicationYear: 1925,
    isbn: '9780743273565'
  },
  {
    id: '2',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    coverImageUrl: 'https://placehold.co/300x450.png',
    summary: 'A poignant novel addressing racial injustice in the American South.',
    averageRating: 4.8,
    genres: ['Classic', 'Fiction', 'Historical'],
    publicationYear: 1960,
    isbn: '9780061120084'
  },
  {
    id: '3',
    title: '1984',
    author: 'George Orwell',
    coverImageUrl: 'https://placehold.co/300x450.png',
    summary: 'A dystopian novel set in a totalitarian society under constant surveillance.',
    averageRating: 4.6,
    genres: ['Dystopian', 'Science Fiction', 'Classic'],
    publicationYear: 1949,
    isbn: '9780451524935'
  },
  {
    id: '4',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    coverImageUrl: 'https://placehold.co/300x450.png',
    summary: 'An epic high-fantasy novel about the quest to destroy the One Ring.',
    averageRating: 4.9,
    genres: ['Fantasy', 'Adventure', 'Classic'],
    publicationYear: 1954,
    isbn: '9780618640157'
  },
];

export const mockInitialComments: Comment[] = [
  { 
    id: 'comment1-list1', 
    userId: 'u2', 
    userName: 'Bob The Builder', 
    text: 'Great collection of classics!', 
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), 
    likes: 5,
    userAvatarUrl: 'https://placehold.co/40x40.png',
    replies: [
      {
        id: 'reply1-comment1-list1',
        userId: 'u1',
        userName: 'Alice Wonderland',
        userAvatarUrl: 'https://placehold.co/40x40.png',
        text: 'Thanks Bob!',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        likes: 2
      }
    ]
  },
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'Alice Wonderland',
    userAvatarUrl: 'https://placehold.co/40x40.png',
    bookId: '1',
    rating: 5,
    reviewText: 'An absolute masterpiece! Fitzgerald captures the Jazz Age perfectly.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    likes: 15,
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Bob The Builder', userAvatarUrl: 'https://placehold.co/40x40.png', text: 'Totally agree!', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), likes: 3 }
    ]
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: 'Bob The Builder',
    userAvatarUrl: 'https://placehold.co/40x40.png',
    bookId: '1',
    rating: 4,
    reviewText: 'A classic for a reason. Thought-provoking and beautifully written.',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    likes: 8
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: 'Charlie Brown',
    userAvatarUrl: 'https://placehold.co/40x40.png',
    bookId: '2',
    rating: 5,
    reviewText: 'Impactful and moving. Scout is an unforgettable character.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
    likes: 22
  },
];

export const mockBookLists: BookList[] = [
  {
    id: 'l1',
    userId: 'u1',
    userName: 'Alice Wonderland',
    name: 'Must-Read Classics',
    description: 'A collection of timeless literary masterpieces.',
    books: [mockBooks[0], mockBooks[1]],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    likes: 30,
    isPublic: true,
    comments: [...mockInitialComments]
  },
  {
    id: 'l2',
    userId: 'u2',
    userName: 'Bob The Builder',
    name: 'Dystopian Futures',
    description: 'Exploring grim possibilities of tomorrow.',
    books: [mockBooks[2]],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    likes: 12,
    isPublic: false,
    comments: []
  },
];
