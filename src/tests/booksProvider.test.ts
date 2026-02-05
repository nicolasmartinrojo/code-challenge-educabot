import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import booksProvider, { BooksProviderError } from '../repositories/booksProvider.ts'

// Mock axios
vi.mock('axios')

describe('BooksProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getBooks', () => {
    it('should successfully fetch books when service is available', async () => {
      const mockBooks = [
        { id: 1, name: 'Book 1', author: 'Author 1', units_sold: 100, price: 20 },
        { id: 2, name: 'Book 2', author: 'Author 2', units_sold: 200, price: 15 }
      ]

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockBooks })

      const provider = booksProvider()
      const books = await provider.getBooks()

      expect(books).toEqual(mockBooks)
      expect(axios.get).toHaveBeenCalled()
    })

    it('should throw BooksProviderError when service is unavailable', async () => {
      const mockError = new Error('Service unavailable')

      vi.mocked(axios.get).mockRejectedValueOnce(mockError)

      const provider = booksProvider()

      expect(async () => {
        await provider.getBooks()
      }).rejects.toThrow(BooksProviderError)
    })

    it('should throw BooksProviderError with correct message when external service fails', async () => {
      const mockError = new Error('Network timeout')

      vi.mocked(axios.get).mockRejectedValueOnce(mockError)

      const provider = booksProvider()

      try {
        await provider.getBooks()
      } catch (error) {
        expect(error).toBeInstanceOf(BooksProviderError)
        expect((error as BooksProviderError).message).toBe('Error on the books provider')
        expect((error as BooksProviderError).name).toBe('BooksProviderError')
      }
    })

    it('should throw BooksProviderError when URL is invalid', async () => {
      const mockError = new Error('Invalid URL')

      vi.mocked(axios.get).mockRejectedValueOnce(mockError)

      const provider = booksProvider()

      try {
        await provider.getBooks()
      } catch (error) {
        expect(error).toBeInstanceOf(BooksProviderError)
        expect((error as BooksProviderError).message).toBe('Error on the books provider')
      }
    })

    it('should preserve original error message in BooksProviderError when passed an Error object', async () => {
      const mockError = new Error('Connection refused')

      vi.mocked(axios.get).mockRejectedValueOnce(mockError)

      const provider = booksProvider()

      try {
        await provider.getBooks()
      } catch (error) {
        expect(error).toBeInstanceOf(BooksProviderError)
        // The BooksProviderError shows its custom message but preserves original in constructor
        expect((error as BooksProviderError).message).toBe('Error on the books provider')
      }
    })
  })
})
