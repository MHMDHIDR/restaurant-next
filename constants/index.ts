// import UserModel from '../models/user-model.js'

// export const ADMIN_EMAIL = await UserModel.find().limit(1)

export const HEADER_BG_IMG = '/assets/img/header-bg-1.webp'

export const SLIDES_IN_MENU = 10

export const SUGGESTED_FOOTER_ITEMS_COUNT = 2

export const ITEMS_PER_PAGE = 5

export const {
  GOOGLE_CLIENT_ID,
  NODE_ENV,
  NEXT_PUBLIC_APP_LOCAL_URL,
  NEXT_PUBLIC_APP_PUBLIC_URL
} = process.env

export const API_URL =
  NODE_ENV === 'development'
    ? NEXT_PUBLIC_APP_LOCAL_URL + '/api'
    : NEXT_PUBLIC_APP_PUBLIC_URL + '/api'
