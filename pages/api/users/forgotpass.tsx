import { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@utils/db'
import UsersModel from '@models/User'
import { APP_URL } from '@constants'
import email from '@functions/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req

  dbConnect()

  switch (method) {
    case 'POST': {
      const { userEmail, userTel } = body
      // Check for user by using his/her email or telephone number
      const user = await UsersModel.findOne({
        $or: [{ userEmail }, { userTel }]
      })

      if (user && user.userAccountStatus === 'block') {
        res.json({
          forgotPassSent: 0,
          message: 'حسابك مغلق حاليا، يرجى التواصل مع الادارة'
        })
      } else if (
        (user && user.userResetPasswordToken !== null) ||
        (user && user.userResetPasswordExpires > Date.now())
      ) {
        res.json({
          forgotPassSent: 0,
          message:
            'لقد تم إرسال رابط تغيير كلمة المرور بالفعل، الرجاء رؤية بريدك الالكتروني'
        })
      } else if (user && user.userAccountStatus === 'active') {
        const userResetPasswordToken = crypto.randomUUID()
        const userResetPasswordExpires = Date.now() + 3600000 // 1 hour

        await UsersModel.findByIdAndUpdate(user._id, {
          userResetPasswordToken,
          userResetPasswordExpires
        })

        //send the user an email with a link to reset his/her password
        const resetLink =
          APP_URL + `:${process.env.PORT || 3000}/auth/reset/${userResetPasswordToken}`

        const emailData = {
          from: 'mr.hamood277@gmail.com',
          to: user.userEmail,
          subject: 'Reset Password',
          msg: `
        <h1>You have requested to reset your password</h1>
        <p>
          Please <a href="${resetLink}" target="_blank">Click Here</a>
          to reset your password, OR use the following link to reset your password: ${resetLink}
          <small>If you did not request this, please ignore this email and your password will remain unchanged.</small>
          <small>Note: This link will expire in 1 hour</small>
        </p>
      `
        }

        try {
          const { accepted, rejected } = await email(emailData)

          if (accepted.length > 0) {
            res.status(200).json({
              message: 'تم ارسال رابط اعادة تعيين كلمة المرور الى بريدك الالكتروني',
              forgotPassSent: 1
            })
          } else if (rejected.length > 0) {
            res.status(400).json({
              forgotPassSent: 0,
              message: `عفواً، لم نستطع ارسال رابط اعادة تعيين كلمة المرور الى بريدك الالكتروني: ${
                rejected[0] /*.message*/
              }`
            })
          }
        } catch (error) {
          res.json({ message: `Ooops!, something went wrong!: ${error} `, mailSent: 0 })
        }
      } else {
        res.json({
          forgotPassSent: 0,
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
