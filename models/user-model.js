import mongoose from 'mongoose'
const connection = mongoose.createConnection(process.env.CONNECTION_URL)

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

const UserModel = connection.model('restaurant', UserSchema)

export default UserModel
