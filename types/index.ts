import { ObjectId } from 'mongoose'
import { Key, MouseEventHandler } from 'react'
import { NextApiRequest } from 'next'

export type UserProps = {
  token: string
  userAccountType: string
  userEmail: string
  userFullName: string
  _id: string
  LoggedIn: number
  message: string
}

export type ModalProps = {
  msg?: string
  extraComponents?: React.ReactNode
  status?: React.ReactNode
  modalHidden?: string
  classes?: string
  redirectLink?: string
  redirectTime?: number
  btnName?: string
  btnLink?: string
  ctaConfirmBtns?: string[]
  ctaSpecialBtns?: string[]
}

export type CartProps = {
  items: any[]
  setItems: any
  addToCart: any
  removeFromCart: any
  setGrandPrice: any
  grandPrice: number
}

export type orderProps = {
  ordersData: {
    grandPrice: number
    orderDate: string
    orderId: string
    orderItems: cardProps[]
    orderStatus: string
    orderToppings: {
      toppingId: string
      toppingPrice: number
    }[]
    paymentData: {
      accelerated: boolean
      billingToken?: string
      facilitatorAccessToken: string
      orderID: string
      payerID: string
      paymentID: string
      paymentSource: string
    }
    personAddress: string
    personName: string
    personNotes: string
    personPhone: string
    userEmail: string
    userId: string
    _id: string
  }
  setOrdersData: any
  removeOrderFromItems: any
  orderItemsGrandPrice: number
  setOrderItemsGrandPrice: any
}

export type FileUploadProps = {
  file: File[]
  fileURLs: string[]
  setFileURLs(fileURLs: string[]): void
  onFileAdd: (e: { target: { files: any } }) => void
  onFileRemove(fileUrl: string, fileName: string): void
}

export type cardProps = {
  cItemId: Key | ObjectId
  cHeading: any
  cDesc: string
  cTags: string[]
  cToppings: Array<any>
  cCtaLabel: any
  cCtaLink?: string
  cImg?: any
  cImgAlt?: string
  cPrice: number
  cCategory: string
  cQuantity?: number
}

export type orderMsgProps = {
  Success: string
  Failure: string
}

export type responseTypes = {
  orderMsg: orderMsgProps
  orderItems: any
  orderToppings: any
  userAccountType: string
  response: Array<any> | null | any
  itemsCount: number
  CategoryList: string[]
  _id: string
  websiteLogoDisplayPath: string
  websiteLogoDisplayName: string
  itemsPerPage: number
  heroBg: string[]
  appName: string
  appDesc: string
  appTagline: string
  instagramAccount: string
  twitterAccount: string
  whatsAppNumber: string
}

export type DividerProps = {
  thickness?: number
  style?: 'dashed'
  marginY?: number
}

export type ImgsProps = {
  length: number
  foodImgs?: string[]
}

export type settingsProps = {
  appName: string
  websiteLogoDisplayPath: string
  appDesc: string
  whatsAppNumber: string
  instagramAccount: string
  twitterAccount: string
}

export type headerProps = {
  appTagline: string
  websiteLogoDisplayPath: string
}

export type MyLinkProps = {
  children: React.ReactNode
  to?: string
  className?: string
}

export type NavMenuPros = {
  children: React.ReactNode
  isOptions?: boolean
  label?: string
  className?: string
}

export type PaginationProps = {
  routeName: string
  pageNum: number
  numberOfPages: number[]
  count: number
  foodId?: string
  itemsPerPage?: number
  category?: string
}

export type ArrowProps = {
  width?: string
  height?: string
  toLeft?: boolean
  css?: string
}

export type LogoProps = {
  width?: string | number
  height?: string | number
  className?: string
  color?: 'white' | 'black' | ''
}

export type SearchContextProps = {
  setSearch: (search: string) => void
  search: string
  searchResults: any[]
  setSearchFor: (searchFor: string) => void
  setFoodCategory: (foodCategory: string) => void
  loading: boolean
  error: any
}

export type TagsProps = {
  tags: string[]
  setTags: (tags: string[]) => void
  removeTags: (index: number) => void
  addTag: (e: React.KeyboardEvent<HTMLInputElement>) => void
  saveSelectedTags: (id: number, tags: string[]) => void
  removeSelectedTags: (id: number) => void
  selectedTags: { id: string; tags: string[] }[]
}

export type AddTagsProps = {
  key: string
  preventDefault: () => void
  target: { value: string }
}

export type removeSelectedTagsProps = {
  id: string
}

export type ThemeProps = {
  isDark: boolean
  setIsDark: (isDark: boolean) => void
  getLocalStorageTheme: () => boolean
}

export type viewFoodDataProps = {
  _id: ObjectId
  foodName: string
  foodPrice: number
  category: string
  foodDesc: string
  foodTags: string[]
  foodToppings: string[]
  foodImgs: string
  length: number
}

export type selectedToppingsProps = {
  toppingId: string
  toppingQuantity?: number
  toppingPrice: number
  toppingName?: string
}

export type NoItemsProps = {
  msg?: string
  links: {
    to: string
    label: string
  }[]
}

export type cCategory = {
  foods: number
  drinks: number
  sweets: number
}

export type orderInfoProps = {
  order?: Object | null
  id?: string
  status: string
  email: string
}

export type notificationProps = {
  sendStatus: number
  sendStatusMsg: string
}

export type mediaProps = {
  foodId?: string | ObjectId
  foodImgDisplayPath: string
  foodName: string
  _id?: ObjectId
  foodPrice?: number
}[]

export type FoodImgsProps = {
  foodImgDisplayPath: string
  foodImgDisplayName: string
}

export type axiosProps = {
  url: string
  method?: string
  body?: string | null
  headers?: string | null
}

export type ServerSideProps = {
  params: {
    id: ObjectId
  }
}

export type EmblaThumbProps = {
  selected: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
  imgSrc: string
  alt: string
}

export type authUserRequestProps = NextApiRequest & {
  user: {
    _id: ObjectId
    userEmail: string
    userAccountType: string
  }
}

export type fileRequestProps = NextApiRequest & {
  files: any
}
