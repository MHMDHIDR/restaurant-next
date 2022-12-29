import mongoose from 'mongoose'

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

const UserSchema = new mongoose.Schema(
  {
    userFullName: reqString,
    userEmail: reqString,
    userTel: reqString,
    userPassword: reqString,
    userAccountStatus,
    userAccountType,
    userResetPasswordToken: typeString,
    userResetPasswordExpires: typeString
  },
  //Collection Name
  { collection: 'restaurant_users' }
)

export default mongoose.models.restaurant || mongoose.model('restaurant', UserSchema)
