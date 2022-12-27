import mongoose from 'mongoose'
const connection = mongoose.createConnection(process.env.CONNECTION_URL)

const reqString = {
  type: String,
  required: true
}

const typeString = {
  type: String
}

const reqNumber = {
  type: Number,
  required: true
}

const typeArray = {
  type: Array
}

const foodToppingsType = {
  type: Object,
  default: [
    {
      toppingName: typeString,
      toppingPrice: reqNumber
    }
  ]
}

const reqDate = {
  type: Date,
  default: Date.now,
  required: true
}

const FoodSchema = new mongoose.Schema(
  {
    foodImgs: typeArray,
    foodName: reqString,
    foodPrice: reqNumber,
    category: reqString,
    foodDesc: reqString,
    foodToppings: foodToppingsType,
    foodTags: typeArray,
    createdAt: reqDate,
    updatedAt: reqDate
  },
  //Collection Name
  { collection: 'restaurant_food' }
)

const WorkModel = connection.model('restaurant', FoodSchema)

export default WorkModel
