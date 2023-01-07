// import UserModel from '../models/user-model.js'

// export const ADMIN_EMAIL = await UserModel.find().limit(1)

export const SLIDES_IN_MENU = 10

export const SUGGESTED_FOOTER_ITEMS_COUNT = 2

export const ITEMS_PER_PAGE = 5

export const API_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_APP_LOCAL_URL + '/api'
    : process.env.NEXT_PUBLIC_APP_PUBLIC_URL + '/api'
