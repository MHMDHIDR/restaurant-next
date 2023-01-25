import { UserProps } from '../types'

export const HEADER_BG_IMG = '/assets/img/header-bg-1.webp'

export const SLIDES_IN_MENU = 10

export const SUGGESTED_FOOTER_ITEMS_COUNT = 2

export const ITEMS_PER_PAGE = 3

export const USER: UserProps =
  typeof window !== 'undefined' &&
  'user' in localStorage &&
  JSON.parse(localStorage.getItem('user') || '{}')

export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_APP_LOCAL_URL
    : process.env.NEXT_PUBLIC_APP_PUBLIC_URL

export const API_URL = APP_URL + '/api'

export const ADMIN_EMAIL = async () =>
  await fetch(API_URL + `/users/all`)
    .then(res => res.json())
    .then(({ response }) => response[0].userEmail)
