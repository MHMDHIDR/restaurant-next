import UserModel from '../models/user-model.js'

export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.APP_LOCAL_URL
    : process.env.APP_PUBLIC_URL

export const ADMIN_EMAIL = await UserModel.find().limit(1)
