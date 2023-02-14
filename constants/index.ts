import { UserProps } from '@types'
import { Types } from 'mongoose'
import { parseJson } from '@functions/jsonTools'
const { ObjectId } = Types

export const HEADER_BG_IMG = '/assets/img/header-bg-1.webp'

export const SLIDES_IN_MENU = 10

export const SUGGESTED_FOOTER_ITEMS_COUNT = 2

export const ITEMS_PER_PAGE = 10

export const FILE_UPLOAD_IMG_SIZE = 122

export const USER: UserProps =
  typeof window !== 'undefined' &&
  'user' in localStorage &&
  parseJson(localStorage.getItem('user') || '{}')

export const APP_URL =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_APP_LOCAL_URL
    : process.env.NEXT_PUBLIC_APP_PUBLIC_URL

export const API_URL = APP_URL + '/api'

export const DEFAULT_FOOD_DATA = {
  _id: '',
  foodName: '',
  foodPrice: 1,
  category: '',
  createdAt: '',
  updatedAt: '',
  foodDesc: '',
  foodTags: [''],
  foodToppings: [
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
