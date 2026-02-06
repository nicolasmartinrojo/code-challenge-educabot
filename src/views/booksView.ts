import { Request, Response } from 'express'
import { BooksController } from '../controllers/booksController.ts'

interface GetBooksQuery {
  author?: string
}

type MetricsResponse = {
  mean_units_sold: number;
  cheapest_book: number;
  books_written_by_author: number;
};
export const booksView = (booksController: BooksController) => {
  return {
    getBooks: async (
      req: Request<{}, {}, {}, GetBooksQuery>,
      res: Response<Promise<MetricsResponse>>,
    ) => {
      await booksController.getBooks(req, res);
    },
  };
};
