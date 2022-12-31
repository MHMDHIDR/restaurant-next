import { createContext, useState, useEffect } from 'react'
export const ToppingsContext = createContext({
  handleToppingChecked: (_toppingId: string, _toppingPrice: number) => {},
  checkedToppings: [],
  setCheckedToppings: (
    _checkedToppings: { toppingId: string; toppingPrice: string }[]
  ) => {},
  handleOrderItemToppingChecked: (_toppingId: string, _toppingPrice: number) => {},
  orderItemToppings: [],
  setOrderItemToppings: (
    _orderItemToppings: { toppingId: string; toppingPrice: string }[]
  ) => {}
})

const checkedToppingsFromLocalStorage = JSON.parse(
  localStorage.getItem('restCheckedToppings') || '[]'
)
// const orderItemToppingsFromLocalStorage = JSON.parse(
//   localStorage.getItem('restOrderItemToppingsToppings') || '[]'
// )

const ToppingsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [checkedToppings, setCheckedToppings] = useState(checkedToppingsFromLocalStorage)
  const [orderItemToppings, setOrderItemToppings] = useState(
    []
    // orderItemToppingsFromLocalStorage
  )

  useEffect(() => {
    localStorage.setItem('restCheckedToppings', JSON.stringify(checkedToppings))
    // localStorage.setItem(
    //   'restOrderItemToppingsToppings',
    //   JSON.stringify(orderItemToppings)
    // )
  }, [checkedToppings /*, orderItemToppings*/])

  const handleToppingChecked = (toppingId: string, toppingPrice: number) => {
    const addTopping = (toppingId: string, toppingPrice: number) => {
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

  const handleOrderItemToppingChecked = (toppingId: string, toppingPrice: number) => {
    const addOrderItemTopping = (toppingId: string, toppingPrice: number) => {
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
