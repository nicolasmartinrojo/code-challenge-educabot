import { Request, Response } from 'express'
import { BooksProvider } from '../providers/books.ts'
import { Book } from '../models/book.ts'
import { BooksProviderError } from '../repositories/booksProvider.ts'

interface GetBooksQuery {
  author?: string
}

export class BooksController {
  constructor(private booksProvider: BooksProvider) {}

    public async getBooks(req: Request<{}, {}, {}, GetBooksQuery>, res: Response<any>) {
    try {
      const { author } = req.query
      const books = await this.booksProvider.getBooks()

      const meanUnitsSold = this.getMeanUnitsSold(books)
      const cheapestBook = this.getCheapestBook(books)
      const booksWrittenByAuthor = author ? this.getBooksWrittenByAuthor(books, author) : []

      res.status(200).json({
        mean_units_sold: meanUnitsSold,
        cheapest_book: cheapestBook,
        books_written_by_author: booksWrittenByAuthor,
      })
    } catch (error) {
        if(error instanceof BooksProviderError){
            res.status(500).json({ error: error.message})
        }else {
            res.status(500).json({ error: 'Internal server error' })
        }
    }
  }

  private getMeanUnitsSold(books: Book[]): number {
    if (books.length === 0) return 0
    const totalUnitsSold = books.reduce((sum, book) => sum + book.units_sold, 0)
    return totalUnitsSold / books.length
  }

  private getCheapestBook(books: Book[]): Book | null {
    if (books.length === 0) return null
    return books.reduce((cheapest, book) => {
      return book.price < cheapest.price ? book : cheapest
    }, books[0])
  }

  private getBooksWrittenByAuthor(books: Book[], author: string): Book[] {
    return books.filter(book => book.author.toLowerCase() === author.toLowerCase())
  }
}
