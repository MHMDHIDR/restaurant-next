import { useState, createContext, useContext } from 'react'
import { orderProps } from '../types'
import { ToppingsContext } from './ToppingsContext'

export const DashboardOrderContext = createContext({} as orderProps)

const DashboardOrderContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [ordersData, setOrdersData] = useState(null)
  const [orderItemsGrandPrice, setOrderItemsGrandPrice] = useState<number>(0)
  const { orderItemToppings, setOrderItemToppings } = useContext(ToppingsContext)

  //remove items from card
  const removeOrderFromItems = (cItemId: string) => {
    setOrdersData((ordersData: { orderItems: { cItemId: string }[] }) => {
      return {
        ...ordersData,
        orderItems: ordersData.orderItems.filter(
          (item: { cItemId: string }) => item.cItemId !== cItemId
        )
      }
    })
    setOrderItemToppings(
      orderItemToppings.filter(
        (topping: { toppingId: string }) => topping.toppingId.slice(0, -2) !== cItemId
      )
    )
  }

  return (
    <DashboardOrderContext.Provider
      value={{
        ordersData,
        setOrdersData,
        removeOrderFromItems,
        orderItemsGrandPrice,
        setOrderItemsGrandPrice
      }}
    >
      {children}
    </DashboardOrderContext.Provider>
  )
}

export default DashboardOrderContextProvider
