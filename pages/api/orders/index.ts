import { NextApiResponse } from 'next'
import { fileRequestProps } from '@types'
import dbConnect from 'utils/db'
import OrdersModel from 'models/Orders'
import paginatedResults from 'middleware/paginatedResults'
import { parseJson } from 'functions/jsonTools'
import formHandler from 'functions/form'
import { randomUUID } from 'crypto'

export default async function handler(req: fileRequestProps, res: NextApiResponse) {
  const { method } = req
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
      const { fields }: any = await formHandler(req)
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
      } = fields

      try {
        const orders = new OrdersModel({
          orderId: randomUUID(),
          userId,
          userEmail,
          personName,
          personPhone,
          personAddress,
          personNotes,
          orderItems: parseJson(foodItems),
          orderToppings: parseJson(checkedToppings),
          grandPrice,
          paymentData: parseJson(paymentData)
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

export const config = {
  api: { bodyParser: false }
}
