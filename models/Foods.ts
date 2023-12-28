import { Schema, models, model } from 'mongoose'

const typeString = { type: String }
const typeArray = { type: Array }

const reqString = { type: String, required: true }

const reqNumber = { type: Number, required: true }

const foodToppingsType = {
  type: Object,
  default: [
    {
      toppingName: typeString,
      toppingPrice: reqNumber
    }
  ]
}

const reqDate = { type: Date, default: Date.now, required: true }

const FoodSchema = new Schema({
  foodName: reqString,
  foodPrice: reqNumber,
  category: reqString,
  foodDesc: reqString,
  foodToppings: foodToppingsType,
  foodTags: typeArray,
  foodImgs: typeArray,
  createdAt: reqDate,
  updatedAt: reqDate
})
export default models?.foods || model('foods', FoodSchema)
