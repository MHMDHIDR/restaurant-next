import mongoose from 'mongoose'

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

const SettingsSchema = new mongoose.Schema(
  {
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
  },
  //Collection Name
  { collection: 'restaurant_settings' }
)

export default mongoose.models.restaurant || mongoose.model('restaurant', SettingsSchema)
