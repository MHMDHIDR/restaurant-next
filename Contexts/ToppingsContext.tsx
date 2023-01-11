import { createContext, useState, useEffect } from 'react'
import { selectedToppingsProps } from '../types'

export const ToppingsContext = createContext({
  handleToppingChecked: (_toppingId: string, _toppingPrice: number) => {},
  checkedToppings: [],
  setCheckedToppings: (
    _checkedToppings: { toppingId: string; toppingPrice: string }[]
  ) => {},
  handleOrderItemToppingChecked: (_toppingId: string, _toppingPrice: number) => {},
  orderItemToppings: {},
  setOrderItemToppings: (_orderItemToppings: selectedToppingsProps[]) => {}
})

const checkedToppingsFromLocalStorage =
  typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('restCheckedToppings') || '[]')
    : '[]'

const ToppingsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [checkedToppings, setCheckedToppings] = useState(checkedToppingsFromLocalStorage)
  const [orderItemToppings, setOrderItemToppings] = useState<selectedToppingsProps[]>([])

  useEffect(() => {
    localStorage.setItem('restCheckedToppings', JSON.stringify(checkedToppings))
  }, [checkedToppings])

  const handleToppingChecked = (
    toppingId: selectedToppingsProps['toppingId'],
    toppingPrice: selectedToppingsProps['toppingPrice']
  ) => {
    const addTopping = (
      toppingId: selectedToppingsProps['toppingId'],
      toppingPrice: selectedToppingsProps['toppingPrice']
    ) => {
      setCheckedToppings([
        ...checkedToppings,
        {
          toppingId,
          toppingPrice
        }
      ])
    }

    const removeTopping = (toppingId: string) => {
      setCheckedToppings(
        checkedToppings.filter(
          (topping: { toppingId: string }) => topping.toppingId !== toppingId
        )
      )
    }

    const topping = checkedToppings.find(
      (topping: { toppingId: string }) => topping.toppingId === toppingId
    )
    !topping ? addTopping(toppingId, toppingPrice) : removeTopping(toppingId)
  }

  const handleOrderItemToppingChecked = (
    toppingId: selectedToppingsProps['toppingId'],
    toppingPrice: selectedToppingsProps['toppingPrice']
  ) => {
    const addOrderItemTopping = (
      toppingId: selectedToppingsProps['toppingId'],
      toppingPrice: selectedToppingsProps['toppingPrice']
    ) => {
      setOrderItemToppings([
        ...orderItemToppings,
        {
          toppingId,
          toppingPrice
        }
      ])
    }

    const removeOrderItemTopping = (toppingId: string) => {
      setOrderItemToppings(
        orderItemToppings.filter(
          (topping: { toppingId: string }) => topping.toppingId !== toppingId
        )
      )
    }

    const theOrderItemToppings = orderItemToppings.find(
      (topping: { toppingId: string }) => topping.toppingId === toppingId
    )
    !theOrderItemToppings
      ? addOrderItemTopping(toppingId, toppingPrice)
      : removeOrderItemTopping(toppingId)
  }

  return (
    <ToppingsContext.Provider
      value={{
        handleToppingChecked,
        checkedToppings,
        setCheckedToppings,
        handleOrderItemToppingChecked,
        orderItemToppings,
        setOrderItemToppings
      }}
    >
      {children}
    </ToppingsContext.Provider>
  )
}

export default ToppingsContextProvider
