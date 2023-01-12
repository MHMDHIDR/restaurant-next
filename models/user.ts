import { Schema, models, model } from 'mongoose'

const reqString = {
  type: String,
  required: true
}

const typeString = {
  type: String
}

const userAccountStatus = {
  ...reqString,
  enum: ['active', 'block'],
  default: 'active'
}

const userAccountType = {
  ...reqString,
  enum: ['admin', 'cashier', 'user'],
  default: 'user'
}

const UserSchema = new Schema({
  userFullName: reqString,
  userEmail: reqString,
  userTel: reqString,
  userPassword: reqString,
  userAccountStatus,
  userAccountType,
  userResetPasswordToken: typeString,
  userResetPasswordExpires: typeString
})

export default models.restaurant_users || model('restaurant_users', UserSchema)
