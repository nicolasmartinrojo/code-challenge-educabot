import { Router } from 'express'
import { BooksController } from '../controllers/booksController.ts'
import { BooksProvider } from '../providers/books.ts'
import { booksView } from '../views/booksView.ts'

export const createBooksRoutes = (booksProvider: BooksProvider) => {
  const router = Router()
  const booksController = new BooksController(booksProvider)
  const view = booksView(booksController)

  router.get('/', view.getBooks)

  return router
}
