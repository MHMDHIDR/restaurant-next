import { ObjectId } from 'mongoose'
import { Key, MouseEventHandler } from 'react'
import { NextApiRequest } from 'next'

export type UserProps = {
  token?: string
  userAccountType?: string
  userEmail?: string
  userFullName: string
  _id?: string
  LoggedIn?: number
  message?: string
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

export type DotButtonProps = {
  selected: boolean
  onClick: MouseEventHandler<HTMLButtonElement>
}

export type PrevNextButtonProps = {
  enabled: boolean
  onClick: DotButtonProps['onClick']
}

export type EmblaThumbProps = DotButtonProps & {
  imgSrc: string
  alt: string
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
    userEmail: any
    userId: string
    _id: string
  }
  setOrdersData: any
  orderToppings?: orderProps['ordersData']['orderToppings']
  removeOrderFromItems: any
  orderItemsGrandPrice: number
  setOrderItemsGrandPrice: any
}

export type orderDataProps = {
  itemsCount: number
  numberOfPages: number
  response: orderProps
}

export type FileUploadProps = {
  file: File[]
  fileURLs: string[]
  setFileURLs(fileURLs: string[]): void
  onFileAdd: (e: { target: { files: any } }) => void
  onFileRemove(fileUrl: string, fileName: string): void
}

export type FileUploadComponentProps = {
  data: {
    foodId?: string
    foodName: string
    defaultImg: {
      foodImgDisplayName: string
      foodImgDisplayPath: string
      websiteLogoDisplayName?: string
    }[]
  }
  ignoreDelete?: boolean
}

export type uploadurlDataProps = {
  data: {
    fields: {
      'Content-Type': string
      'PolicyX-Amz-Algorithm': string
      'X-Amz-Credential': string
      'X-Amz-Date': string
      'X-Amz-Signature': string
      bucket: string
      key: string
    }
    url: string
  }[]
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
  numberOfPages: number
  CategoryList: string[]
  _id: string
  websiteLogoDisplayPath: string
  websiteLogoDisplayName: string
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
  color?: string
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
  src?: string
}

export type orderInfoProps = {
  order?: Object | null
  id?: string
  status: string
  email: string
}

export type PaginationProps = {
  routeName: string
  pageNum: number
  numberOfPages: number
  count: number
  foodId?: string
  itemsPerPage?: number
  category?: string
  loaction?: string
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
  removeSelectedTags: (id: number) => any
  selectedTags: { id: string; tags: string[] }[]
}

export type AddTagsProps = {
  key: string
  preventDefault: () => void
  target: { value: string } | any
}

export type removeSelectedTagsProps = {
  id: number
}

export type ThemeProps = {
  isDark: boolean
  setIsDark: (isDark: boolean) => void
  getLocalStorageTheme: () => boolean
}

export type FoodImgsProps = {
  foodImgDisplayPath: string
  foodImgDisplayName: string
}

export type foodDataProps = {
  response: {
    _id: string
    foodName: string
    foodPrice: number
    category: string
    createdAt: string
    updatedAt: string
    foodDesc: string
    foodTags: string[]
    foodToppings: ToppingsProps[]
    foodImgs: FoodImgsProps[]
    foodImgDisplayName?: FoodImgsProps['foodImgDisplayName']
    foodImgDisplayPath?: FoodImgsProps['foodImgDisplayPath']
  }
  itemsCount?: number
  next: {
    limit: number
    page: number
  }
  numberOfPages?: number
}

export type selectedToppingsProps = {
  toppingId: string
  toppingQuantity?: number
  toppingPrice: number
  toppingName?: string
}

export type ToppingsProps = {
  toppingName: string
  toppingPrice: number
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

export type authUserRequestProps = NextApiRequest & {
  user: {
    _id: ObjectId
    userEmail: string
    userAccountType: string
  }
}

export type fileRequestProps = NextApiRequest & {
  key: string
  type: string
}

export type ButtonProps = {
  children: JSX.Element
  color?: string
}

export type deleteFoodEventListenerProps = {
  target: {
    id: string
    dataset: {
      imgName: string
      name: string
    }
  }
}

export type DashboardHomeProps = {
  orderItemsCount: number
  menuItemsCount: number
}
