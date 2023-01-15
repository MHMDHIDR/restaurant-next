import UserModel from '../models/User'
import { UserProps } from '../types'

export const HEADER_BG_IMG = '/assets/img/header-bg-1.webp'

export const SLIDES_IN_MENU = 10

export const SUGGESTED_FOOTER_ITEMS_COUNT = 2

export const ITEMS_PER_PAGE = 5

export const USER: UserProps =
  typeof window !== 'undefined' &&
  'user' in localStorage &&
  JSON.parse(localStorage.getItem('user') || '{}')

export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_APP_LOCAL_URL
    : process.env.NEXT_PUBLIC_APP_PUBLIC_URL

export const API_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_APP_LOCAL_URL + '/api'
    : process.env.NEXT_PUBLIC_APP_PUBLIC_URL + '/api'

export const ADMIN_EMAIL = async () =>
  await UserModel.find()
    .limit(1)
    .then((res: any) => res.json())
