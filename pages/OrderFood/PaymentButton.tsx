import React from 'react'
import ReactDOM from 'react-dom'

const PayPalButton = (window as any)?.paypal?.Buttons?.driver('react', {
  React,
  ReactDOM
})

const PaymentButton = ({ value, onSuccess }) => {
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
      application_context: {
        return_url:
          process.env.NODE_ENV === 'development'
            ? 'http://dev.com:3000'
            : 'https://mhmdhidr-restaurant.netlify.app'
      }
    })

  const onApprove = async (data: any, actions: { order: { capture: () => any } }) => {
    await actions.order.capture()
    onSuccess(data)
    return data
  }

  const onCancel = () => alert('تم الغاء الدفع')

  const onError: any = (error: any) => console.error('some error happened=> ', error)

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
      onError={(err: any) => onError(err)}
    />
  )
}

export default PaymentButton
