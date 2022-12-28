export interface UserProps {
  token: string
  userAccountType: string
  userEmail: string
  userFullName: string
  _id: string
}

export interface ModalProps {
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

export interface CartProps {
  items: any[]
  setItems: any
  addToCart: any
  removeFromCart: any
  setGrandPrice: any
  grandPrice: number
}

export interface orderProps {
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

export interface FileUploadProps {
  file: File[]
  fileURLs: string[]
  setFileURLs(fileURLs: string[]): void
  onFileAdd: (e: { target: { files: any } }) => void
  onFileRemove(fileUrl: string, fileName: string): void
}

export interface cardProps {
  cItemId: string
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

export interface orderMsgProps {
  Success: string
  Failure: string
}

export interface responseTypes {
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
  heroBg: string[]
  appName: string
  appDesc: string
  appTagline: string
  instagramAccount: string
  twitterAccount: string
  whatsAppNumber: string
}

export interface DividerProps {
  thickness?: number
  style?: 'dashed'
  marginY?: number
}

export interface ImgsProps {
  length: number
  foodImgs?: string[]
}

export interface settingsProps {
  appName: string
  websiteLogoDisplayPath: string
  appDesc: string
  whatsAppNumber: string
  instagramAccount: string
  twitterAccount: string
}

export interface headerProps {
  appTagline: string
  websiteLogoDisplayPath: string
}

export interface MyLinkProps {
  children: React.ReactNode
  to?: string
  className?: string
}

export interface NavMenuPros {
  children: React.ReactNode
  isOptions?: boolean
  label?: string
  className?: string
}

export interface PaginationProps {
  routeName: string
  pageNum: number
  numberOfPages: number[]
  count: number
  foodId?: string
  itemsPerPage?: number
  category?: string
  loaction?: string
}

export interface ArrowProps {
  width?: string
  height?: string
  toLeft?: boolean
  css?: string
}

export interface LogoProps {
  width?: string | number
  height?: string | number
  className?: string
  color?: 'white' | 'black' | ''
}

export interface SearchContextProps {
  setSearch: (search: string) => void
  search: string
  searchResults: any[]
  setSearchFor: (searchFor: string) => void
  setFoodCategory: (foodCategory: string) => void
  loading: boolean
  error: any
}

export interface TagsProps {
  tags: string[]
  setTags: (tags: string[]) => void
  removeTags: (index: number) => void
  addTag: (e: React.KeyboardEvent<HTMLInputElement>) => void
  saveSelectedTags: (id: number, tags: string[]) => void
  removeSelectedTags: (id: number) => void
  selectedTags: { id: string; tags: string[] }[]
}

export interface AddTagsProps {
  key: string
  preventDefault: () => void
  target: { value: string }
}

export interface removeSelectedTagsProps {
  id: string
}

export interface ThemeProps {
  isDark: boolean
  setIsDark: (isDark: boolean) => void
  getLocalStorageTheme: () => boolean
}

export interface viewFoodDataProps {
  _id: string
  foodName: string
  foodPrice: number
  category: string
  foodDesc: string
  foodTags: string[]
  foodToppings: string[]
  foodImgs: string
  length: number
}

export interface selectedToppingsProps {
  toppingId: string
  toppingQuantity: number
  toppingPrice: number
}

export interface NoItemsProps {
  msg?: string
  links: {
    to: string
    label: string
  }[]
}

export interface cCategory {
  foods: number
  drinks: number
  sweets: number
}

export interface orderInfoProps {
  order?: Object | null
  id?: string
  status: string
  email: string
}
