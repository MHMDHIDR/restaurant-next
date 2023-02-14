import { NextApiRequest, NextApiResponse } from 'next'
import { Types } from 'mongoose'
import dbConnect from '../../../utils/db'
import OrdersModel from '@models/Orders'
import email from '@functions/email'
import { parseJson } from '@functions/jsonTools'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req
  await dbConnect()

  switch (method) {
    case 'PATCH': {
      const _id: any = query.orderId

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
      } = body

      //if not valid _id then return error message
      if (!Types.ObjectId.isValid(_id)) {
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
                orderItems: parseJson(foodItems),
                orderToppings: parseJson(checkedToppings),
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
        res.status(404).json({ message: error })
      }
      break
    }

    case 'DELETE': {
      const { orderId } = query

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
