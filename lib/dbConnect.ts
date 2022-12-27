import mongoose from 'mongoose'

const { MONGODB_URI } = process.env

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

mongoose
  .connect(MONGODB_URI, { retryWrites: true, w: 'majority' })
  .then(() => console.log('DB Connected'))
  .catch(error => console.error(error))
