import mongoose from 'mongoose'
const connection = mongoose.createConnection(process.env.CONNECTION_URL)

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

const OrderSchema = new mongoose.Schema(
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

const FoodModel = connection.model('restaurant', OrderSchema)

export default FoodModel
