import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import OrdersModel from '../../../models/Orders'
import paginatedResults from '../../../middleware/paginatedResults'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req
  await dbConnect()

  switch (method) {
    case 'GET': {
      try {
        const orders = await paginatedResults(OrdersModel, req, res)
        res.status(200).json(orders)
      } catch (error) {
        res.json('Failed to get orders!' + error)
      }
      break
    }

    case 'POST': {
      const {
        userId,
        userEmail,
        personName,
        personPhone,
        personAddress,
        personNotes,
        foodItems,
        checkedToppings,
        grandPrice,
        paymentData
      } = req.body

      try {
        const orders = new OrdersModel({
          orderId: crypto.randomUUID(),
          userId,
          userEmail,
          personName,
          personPhone,
          personAddress,
          personNotes,
          orderItems: JSON.parse(foodItems),
          orderToppings: JSON.parse(checkedToppings),
          grandPrice,
          paymentData: JSON.parse(paymentData)
        })

        await orders.save()
        res.json({ orderAdded: 1 })
      } catch ({ message }) {
        res.json({ message, orderAdded: 0 })
      }
      break
    }

    case 'PATCH': {
      const _id = req.params.orderId
      const {
        orderEmail,
        personName,
        personPhone,
        personAddress,
        personNotes,
        foodItems,
        checkedToppings,
        grandPrice,
        orderStatus
      } = req.body

      //if not valid _id then return error message
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.json({ message: `Sorry, No Order with this ID => ${_id}` })
      }

      //else update the order status
      try {
        const orderUpdated = personName
          ? await OrdersModel.findByIdAndUpdate(
              //update all order data
              _id,
              {
                personName,
                personPhone,
                personAddress,
                personNotes,
                orderItems: JSON.parse(foodItems),
                orderToppings: JSON.parse(checkedToppings),
                grandPrice
              },
              { new: true }
            )
          : await OrdersModel.findByIdAndUpdate(_id, { orderStatus }, { new: true }) //only update the order status

        //if order updated then send email to user
        if (orderStatus && orderUpdated) {
          const emailData = {
            from: 'mr.hamood277@gmail.com',
            to: orderEmail,
            subject: `Order is ${orderStatus}ed`,
            msg: `
        <h1>Your Order at Restaurant is ${orderStatus}ed ${
              orderStatus === 'accept' ? '✅ 😃' : '❌ 😢'
            }</h1>
        <p>
          This is an email is to let you know that your order has been ${orderStatus}ed.
          <small>If you have any queries please contact us at Mr.hamood277@gmail.com</small>
        </p>
      `
          }

          const { accepted, rejected } = await email(emailData)

          if (accepted.length > 0) {
            res.status(200).json({
              message: 'Order Status Updated Successfully',
              OrderStatusUpdated: 1
            })
          } else if (rejected.length > 0) {
            res.status(200).json({
              message: 'Error: Order Did NOT Update',
              OrderStatusUpdated: 1
            })
          }
        } else if (orderUpdated) {
          res.status(200).json({
            message: 'Order Status Updated Successfully',
            OrderStatusUpdated: 1
          })
          return
        }

        res.status(200).json({
          message: 'Error: Order Did NOT Update',
          OrderStatusUpdated: 1
        })
      } catch (error) {
        res.status(404).json({ message: error.message })
      }
      break
    }

    case 'DELETE': {
      const { orderId } = req.params

      try {
        await OrdersModel.findByIdAndDelete(orderId)

        res.json({
          message: 'Order Deleted Successfully',
          orderDeleted: 1
        })
      } catch (error) {
        res.json({
          message: `Sorry! Something went wrong, check the error => 😥: \n ${error}`,
          orderDeleted: 0
        })
      }
      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }

  // export const createPdf = async (req, res) => {
  //   const { _id } = req.body

  //   const order = await OrdersModel.findById(_id)

  //   res.json({ orderInfoInvoice: order })
  // }

  // export const fetchPdf = async (_req, res) => {
  //   res.sendFile(`../result.pdf`)
  // }
}
