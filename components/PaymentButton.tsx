import React from 'react'
import ReactDOM from 'react-dom'
import { origin /*as return_url*/ } from '@constants'

const PayPalButton =
  typeof window !== 'undefined' &&
  (window as any)?.paypal?.Buttons?.driver('react', {
    React,
    ReactDOM
  })

const PaymentButton = ({ value, onSuccess }: any) => {
  const createOrder = (
    _: any,
    actions: {
      order: {
        create: (arg: {
          purchase_units: { amount: { value: number } }[]
          application_context: { return_url: string }
        }) => any
      }
    }
  ) =>
    actions.order.create({
      purchase_units: [{ amount: { value } }],
      application_context: { return_url: origin }
    })

  const onApprove = async (data: any, actions: { order: { capture: () => any } }) => {
    await actions.order.capture()
    onSuccess(data)
    return data
  }

  const onCancel = () => alert('تم الغاء الدفع')

  const onError = (error: any) => console.error('some error happened=> ', error)

  return (
    <PayPalButton
      createOrder={(
        data: any,
        actions: {
          order: {
            create: (arg: { purchase_units: { amount: { value: number } }[] }) => any
          }
        }
      ) => createOrder(data, actions)}
      onApprove={(data: any, actions: { order: { capture: () => any } }) =>
        onApprove(data, actions)
      }
      onCancel={onCancel}
    />
  )
}

export default PaymentButton
