import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { BooksProvider } from '../providers/books'
import { Book } from '../models/book'
import { BooksController } from '../controllers/booksController'
import { BooksProviderError } from '../repositories/booksProvider'

describe('metricsHandler', () => {
  // Mock data
  const mockBooks: Book[] = [
    { id: 1, name: 'Book 1', author: 'Author 1', units_sold: 100, price: 20 },
    { id: 2, name: 'Book 2', author: 'Author 2', units_sold: 200, price: 15 },
    { id: 3, name: 'Book 3', author: 'Author 1', units_sold: 300, price: 25 }
  ]

  // Mock BooksProvider
  const mockBooksProvider: BooksProvider = {
    getBooks: vi.fn().mockReturnValue(mockBooks)
  }

  // Set up handler with mock provider
  const handler = new BooksController(mockBooksProvider)

  // Mock request and response
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: any

  beforeEach(() => {
    jsonMock = vi.fn()
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: jsonMock
    }
    mockReq = {
      query: {}
    }
  })

  describe('get', () => {
    it('should return metrics with empty author query', async () => {
      await handler.getBooks(mockReq as any, mockRes as any)

      expect(mockBooksProvider.getBooks).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        mean_units_sold: 200,
        cheapest_book: mockBooks[1],
        books_written_by_author: []
      })
    })

    it('should return metrics with author query', async () => {
      mockReq.query = { author: 'Author 1' }

      await handler.getBooks(mockReq as any, mockRes as any)

      expect(mockBooksProvider.getBooks).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(jsonMock).toHaveBeenCalledWith({
        mean_units_sold: 200,
        cheapest_book: mockBooks[1],
        books_written_by_author: [
          mockBooks[0],
          mockBooks[2]
        ]
      })
    })

    it('should handle BooksProviderError and return 500 status with error message', async () => {
      const errorMessage = 'Error on the books provider'
      vi.mocked(mockBooksProvider.getBooks).mockRejectedValueOnce(
        new BooksProviderError('External service unavailable')
      )

      await handler.getBooks(mockReq as any, mockRes as any)

      expect(mockBooksProvider.getBooks).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: errorMessage
      })
    })

    it('should handle generic error and return 500 status with generic message', async () => {
      vi.mocked(mockBooksProvider.getBooks).mockRejectedValueOnce(
        new Error('Unexpected error')
      )

      await handler.getBooks(mockReq as any, mockRes as any)

      expect(mockBooksProvider.getBooks).toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal server error'
      })
    })
  })

  describe('getMeanUnitsSold', () => {
    it('should calculate correct mean units sold for multiple books', () => {
      const books: Book[] = [
        { id: 1, name: 'Book 1', author: 'Author 1', units_sold: 100, price: 20 },
        { id: 2, name: 'Book 2', author: 'Author 2', units_sold: 200, price: 15 },
        { id: 3, name: 'Book 3', author: 'Author 3', units_sold: 300, price: 25 }
      ]

      const result = (handler as any).getMeanUnitsSold(books)

      expect(result).toBe(200) // (100 + 200 + 300) / 3 = 200
    })

    it('should return 0 for empty books array', () => {
      const result = (handler as any).getMeanUnitsSold([])

      expect(result).toBe(0)
    })

    it('should calculate mean for single book', () => {
      const books: Book[] = [
        { id: 1, name: 'Book 1', author: 'Author 1', units_sold: 150, price: 20 }
      ]

      const result = (handler as any).getMeanUnitsSold(books)

      expect(result).toBe(150)
    })

    it('should calculate mean with decimal values', () => {
      const books: Book[] = [
        { id: 1, name: 'Book 1', author: 'Author 1', units_sold: 100, price: 20 },
        { id: 2, name: 'Book 2', author: 'Author 2', units_sold: 200, price: 15 }
      ]

      const result = (handler as any).getMeanUnitsSold(books)

      expect(result).toBe(150) // (100 + 200) / 2 = 150
    })
  })
})
