import { Request, Response } from 'express'
import { BooksController } from '../controllers/booksController.ts'

interface GetBooksQuery {
  author?: string
}

export const booksView = (booksController: BooksController) => {
  return {
    getBooks: async (req: Request<{}, {}, {}, GetBooksQuery>, res: Response<any>) => {
      await booksController.getBooks(req, res)
    }
  }
}
