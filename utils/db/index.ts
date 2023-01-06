import mongoose from 'mongoose'

const { MONGODB_URI } = process.env
const connectMongo = async () => mongoose.connect(MONGODB_URI)

export default connectMongo
