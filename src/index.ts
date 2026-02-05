import express from 'express'
import cors from 'cors'
import BooksProvider from './repositories/booksProvider.ts'
import { createBooksRoutes } from './routes/booksRoutes.ts'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

const booksProvider = BooksProvider()
app.use('/', createBooksRoutes(booksProvider))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { app }
