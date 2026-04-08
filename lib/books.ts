import fs from 'fs';
import path from 'path';

const booksPath = path.join(process.cwd(), 'content', 'books.json');

export interface Book {
  title: string;
  author: string;
  status: 'reading' | 'finished';
  year: number;
  dateFinished?: string;
}

export interface BooksData {
  goal: number;
  books: Book[];
}

export function getBooks(): BooksData {
  if (!fs.existsSync(booksPath)) {
    return { goal: 12, books: [] };
  }
  const raw = fs.readFileSync(booksPath, 'utf8');
  return JSON.parse(raw) as BooksData;
}

export function getBooksByYear(year: number): Book[] {
  const { books } = getBooks();
  return books
    .filter((b) => b.year === year)
    .sort((a, b) => {
      if (a.status === 'reading') return -1;
      if (b.status === 'reading') return 1;
      return (b.dateFinished || '').localeCompare(a.dateFinished || '');
    });
}

export function getCurrentlyReading(): Book | null {
  const { books } = getBooks();
  return books.find((b) => b.status === 'reading') || null;
}

export function getAllYears(): number[] {
  const { books } = getBooks();
  const years = [...new Set(books.map((b) => b.year))];
  return years.sort((a, b) => b - a);
}
