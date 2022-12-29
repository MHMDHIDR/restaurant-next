// import UserModel from '../models/user-model.js'

// export const ADMIN_EMAIL = await UserModel.find().limit(1)

export const API_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.APP_LOCAL_URL
    : process.env.APP_PUBLIC_URL
