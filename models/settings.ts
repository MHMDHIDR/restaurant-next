import { model, models, Schema } from 'mongoose'

const reqString = {
  type: String,
  required: true
}
const reqArray = {
  type: Array,
  required: true
}
const typeString = {
  type: String
}
const orderMsg = {
  Success: typeString,
  Failure: typeString
}

const SettingsSchema = new Schema({
  websiteLogoDisplayPath: reqString,
  websiteLogoDisplayName: reqString,
  appName: reqString,
  appDesc: reqString,
  appTagline: reqString,
  whatsAppNumber: typeString,
  instagramAccount: typeString,
  twitterAccount: typeString,
  heroBg: reqArray,
  CategoryList: reqArray,
  orderMsg
})
export default models?.restaurant_settings || model('restaurant_settings', SettingsSchema)
