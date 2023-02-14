import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import UsersModel from '@models/User'
import { sign } from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const { verifyIdToken } = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req

  dbConnect()

  switch (method) {
    case 'POST': {
      const { tokenId } = body
      const { getPayload } = await verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID
      })

      const users: never[] = []
      const upsert = (array: any[], item: { name?: string; email: string }) => {
        const i = array.findIndex(
          (_item: { email: string }) => _item.email === item.email
        )
        if (i > -1) array[i] = item
        else array.push(item)
      }
      const { name, email }: any = getPayload()
      upsert(users, { name, email })

      // Check for user by using his/her email
      const user = await UsersModel.findOne({ userEmail: email })

      if (user) {
        //if user exists
        res.status(200).json({
          LoggedIn: 1,
          message: `تم تسجيل الدخول بنجاح، جار تحويلك الى ${
            //if user is admin navigate to dashboard else navigate to home page
            user.userAccountType === 'admin' ? 'لوحة التحكم' : 'الصفحة الرئيسية'
          }`,
          _id: user.id,
          userAccountType: user.userAccountType,
          userFullName: user.userFullName,
          userEmail: user.userEmail,
          userTel: user.userTel,
          token: generateToken(user._id)
        })
      } else if (!user) {
        //if the user does not exist Create user
        const newUser = await UsersModel.create({
          userFullName: email.split('@')[0],
          userEmail: email,
          userTel: 'N/A',
          userPassword: 'N/A'
        })

        if (newUser) {
          //if user is created successfully
          res.status(201).json({
            _id: newUser.id,
            userFullName: newUser.userFullName,
            userEmail: newUser.email,
            token: generateToken(newUser._id),
            LoggedIn: 1,
            message: 'تم تسجيل الدخول بنجاح، جار تحويلك الى الصفحة الرئيسية',
            userAccountType: 'user'
          })
        }
      }
      break
    }

    default: {
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}

const generateToken = (id: any) =>
  sign({ id }, process.env.JWT_SECRET || '', { expiresIn: '30d' })
