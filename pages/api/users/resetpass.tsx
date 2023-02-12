import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../utils/db'
import UsersModel from '../../../models/User'
import { sign } from 'jsonwebtoken'
import { genSalt, hash } from 'bcryptjs'
import email from '../../../utils/functions/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req

  dbConnect()

  switch (method) {
    case 'POST': {
      const { userPassword, userToken } = body
      // Check for user by using his/her email or telephone number
      const user = await UsersModel.findOne({
        // $or: [{ userPassword}, { userToken }]
        userResetPasswordToken: userToken
      })

      if (user && user.userAccountStatus === 'block') {
        res.json({
          newPassSet: 0,
          message: 'حسابك مغلق حاليا، يرجى التواصل مع الادارة'
        })
      } else if (user && user.userAccountStatus === 'active') {
        if (userToken === user.userResetPasswordToken) {
          if (user.userResetPasswordExpires > Date.now()) {
            // Hash new password
            const salt = await genSalt(10)
            const hashedPassword = await hash(userPassword, salt)

            await UsersModel.findByIdAndUpdate(user._id, {
              userPassword: hashedPassword,
              userResetPasswordToken: null,
              userResetPasswordExpires: null
            })

            res.json({
              message: 'تم تغيير كلمة المرور بنجاح، سيتم تحويلك لتسجيل الدخول',
              newPassSet: 1
            })
          } else {
            res.json({
              newPassSet: 0,
              message: 'عفواً، لقد انتهى صلاحية رابط اعادة تعيين كلمة المرور الخاص بك'
            })
          }
        }

        //send the user an email with a link to reset his/her password
        const emailData = {
          from: 'mr.hamood277@gmail.com',
          to: user.userEmail,
          subject: 'Your Password Has been Reset',
          msg: `
      <h1>Your password has been rest succefully</h1>
      <br />
      <p>
      If you did not reset your password, please contact us as soon as possible, otherwise this email is just for notifying you for the change that happened, no need to reply to this email.</small>
      </p>
      `
        }

        try {
          const { accepted, rejected } = await email(emailData)

          if (accepted.length > 0) {
            res.status(200).json({
              message: 'تم ارسال رسالة تحديث كلمة المرور الى بريدك الالكتروني',
              newPassSet: 1
            })
          } else if (rejected.length > 0) {
            res.status(400).json({
              newPassSet: 0,
              message: `عفواً، لم نستطع ارسال رسالة تحديث كلمة المرور الى بريدك الالكتروني: ${
                rejected[0] /*.message*/
              }`
            })
          }
        } catch (error) {
          res.json({ message: `Ooops!, something went wrong!: ${error} `, mailSent: 0 })
        }
      } else if (!user) {
        res.json({
          newPassSet: 0,
          message: 'عفواً، ليس لديك حساب مسجل معنا'
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
