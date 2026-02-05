/// <reference types="vite/client" />
import axios from "axios";
import { Book } from "../../models/book";
import { BooksProvider } from "../../providers/books.ts";

const booksProvider = (): BooksProvider => {
  const getBooks = async (): Promise<Book[]> => {
    const response = await axios.get<Book[]>(
      import.meta.env.VITE_BOOKS_PROVIDER_URL,
    );
    return response.data;
  };

  return {
    getBooks,
  };
};

export default booksProvider;
