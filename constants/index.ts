import { UserProps } from '@types'
import { parseJson } from 'functions/jsonTools'

export const { origin }: any = typeof window !== 'undefined' && window.location

export const HEADER_BG_IMG = '/assets/img/header-bg-1.webp'

export const SLIDES_IN_MENU = 10

export const SUGGESTED_FOOTER_ITEMS_COUNT = 2

export const ITEMS_PER_PAGE = 10

export const MAX_QUANTITY = 100

export const FILE_UPLOAD_IMG_SIZE = 122

export const SCROLL_LIMIT = 400

export const USER: UserProps =
  typeof window !== 'undefined' &&
  'user' in localStorage &&
  parseJson(localStorage.getItem('user') || '{}')

const url = {
  local: `localhost`,
  dev: `dev.com`
}

export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? origin?.includes(url.dev)
      ? `http://${url.dev}:3001`
      : `http://${url.local}:3001`
    : process.env.NEXT_PUBLIC_APP_PUBLIC_URL

export const API_URL = APP_URL + '/api'

export const DEFAULT_USER_DATA = {
  userFullName: 'المستخدم',
  userAccountType: 'user'
}

export const DEFAULT_FOOD_DATA = {
  _id: '',
  foodName: '',
  foodNameEn: '',
  foodPrice: 1,
  category: '',
  categoryEn: '',
  createdAt: '',
  updatedAt: '',
  foodDesc: '',
  foodDescEn: '',
  foodTags: [''],
  foodTagsEn: [''],
  foodToppings: [
    {
      toppingName: '',
      toppingPrice: 1
    }
  ],
  foodToppingsEn: [
    {
      toppingName: '',
      toppingPrice: 1
    }
  ],
  foodImgs: [
    {
      foodImgDisplayName: '',
      foodImgDisplayPath: ''
    }
  ],
  foodImgDisplayName: '',
  foodImgDisplayPath: ''
}

export const ADMIN_EMAIL = async () =>
  await fetch(API_URL + `/users/all`)
    .then(res => res.json())
    .then(({ response }) => response[0].userEmail)
