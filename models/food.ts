import mongoose from 'mongoose'

const typeString = { type: String }
const typeArray = { type: Array }

const reqString = {
  type: String,
  required: true
}

const reqNumber = {
  type: Number,
  required: true
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

export default mongoose.models.restaurant || mongoose.model('restaurant', FoodSchema)
