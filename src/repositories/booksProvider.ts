/// <reference types="vite/client" />
import axios from "axios";
import { Book } from "../models/book.ts";
import { BooksProvider } from "../providers/books.ts";

export class BooksProviderError extends Error {
  constructor(message: string | Error) {
    super(message instanceof Error ? message.message : message);
    this.name = "BooksProviderError";
    this.message = "Error on the books provider"
  }
}


const booksProvider = (): BooksProvider => {
  const getBooks = async (): Promise<Book[]> => {
    const response = await axios.get<Book[]>(
      import.meta.env.VITE_BOOKS_PROVIDER_URL,
    ).catch((error) => {
        throw new BooksProviderError(error);
    });
    return response.data;
  };

  return {
    getBooks,
  };
};

export default booksProvider;
