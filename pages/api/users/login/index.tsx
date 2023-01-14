import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../../utils/db'
import UsersModel from '../../../../models/User'
import { sign } from 'jsonwebtoken'
import { compare } from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req

  dbConnect()

  switch (method) {
    case 'POST': {
      const { userEmail, userTel, userPassword } = body
      // Check for user by using his/her email or telephone number
      const user = await UsersModel.findOne({
        $or: [{ userEmail }, { userTel }]
      })

      if (user && user.userAccountAction === 'block') {
        res.status(403).json({
          LoggedIn: 0,
          message: 'حسابك مغلق حاليا، يرجى التواصل مع الادارة'
        })
      } else if (user && (await compare(userPassword, user.userPassword))) {
        res.status(200).json({
          LoggedIn: 1,
          message: `تم تسجيل الدخول بنجاح، جار تحويلك الى ${
            user.userAccountType === 'admin' ? 'لوحة التحكم' : 'الصفحة الرئيسية'
          }`,
          _id: user.id,
          userAccountType: user.userAccountType,
          userFullName: user.userFullName,
          userEmail: user.userEmail,
          userTel: user.userTel,
          token: generateToken(user._id)
        })
      } else {
        res.json({
          LoggedIn: 0,
          message: 'البيانات المدخلة غير صحيحة'
        })
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
