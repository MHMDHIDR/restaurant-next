import { Schema, models, model } from 'mongoose'

const reqNumber = {
  type: Number,
  required: true
}

const reqString = {
  type: String,
  required: true
}

const reqObject = {
  type: Object,
  required: true
}

const orderStatus = {
  ...reqString,
  enum: ['pending', 'accept', 'reject'],
  default: 'pending'
}

const reqDate = {
  type: Date,
  default: Date.now,
  required: true
}

const OrderSchema = new Schema(
  {
    orderId: reqString,
    userId: reqString,
    userEmail: reqString,
    personName: reqString,
    personPhone: reqString,
    personAddress: reqString,
    personNotes: {
      type: String
    },
    orderItems: reqObject,
    orderToppings: reqObject,
    grandPrice: reqNumber,
    paymentData: reqObject,
    orderStatus,
    orderDate: reqDate
  },
  //Collection Name
  { collection: 'restaurant_orders' }
)

export default models.restaurant || model('restaurant', OrderSchema)
