import { useState, createContext, useContext, useEffect } from 'react'
import { CartProps } from '@types'
import { parseJson, stringJson } from 'functions/jsonTools'
import { ToppingsContext } from './ToppingsContext'

const cartFromLocalStorage =
  typeof window !== 'undefined'
    ? parseJson(localStorage.getItem('restCartItems') || '[]')
    : []

export const CartContext = createContext({} as CartProps)

const CartContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState(cartFromLocalStorage)
  const [grandPrice, setGrandPrice] = useState<number>(0)
  const { checkedToppings, setCheckedToppings } = useContext(ToppingsContext)

  useEffect(() => {
    localStorage.setItem('restCartItems', stringJson(items))
  }, [items])

  //add items to card add the details like: cHeading, cImg, cPrice, cCategory, cDesc, cToppings, cQuantity: 1

  const addToCart = (
    cItemId: string,
    cHeading: string,
    cImg: string,
    cPrice: string,
    cCategory: string,
    cDesc: string,
    cToppings: any[]
  ) => {
    setItems([
      ...items,
      {
        cItemId,
        cHeading,
        cImg,
        cPrice,
        cCategory,
        cDesc,
        cToppings: cToppings.length //if it's array then map over it
          ? cToppings.map((topping, toppingIndex) => {
              return {
                toppingId: cItemId + '-' + toppingIndex,
                ...topping,
                toppingQuantity: 1
              }
            })
          : [],
        cQuantity: 1
      }
    ])
  }

  //remove items from card
  const removeFromCart = (cItemId: string) => {
    setItems(items.filter((item: { cItemId: string }) => item.cItemId !== cItemId))
    setCheckedToppings(
      checkedToppings.filter(
        (topping: { toppingId: string }) => topping.toppingId.slice(0, -2) !== cItemId
      )
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        setItems,
        addToCart,
        removeFromCart,
        grandPrice,
        setGrandPrice
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export default CartContextProvider
