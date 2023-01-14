import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import OrdersModel from '../../../models/Orders'
import paginatedResults from '../../../middleware/paginatedResults'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req
  await dbConnect()

  switch (method) {
    case 'GET': {
      try {
        const orders = await paginatedResults(OrdersModel, req, res)
        res.status(200).json(orders)
      } catch (error) {
        res.json('Failed to get orders!: ' + error)
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
      } = body

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
