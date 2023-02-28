import { createTransport } from 'nodemailer'
import { ADMIN_EMAIL } from '@constants'

const email = async ({ name, subject, from, to, msg }: any) => {
  /**
   * @returns {Promise<any>} JSON
   */

  to = to || (await ADMIN_EMAIL())
  from = from || (await ADMIN_EMAIL())
  name = name || to

  // create reusable transporter object using the default SMTP transport
  const transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASSWORD
    }
  })

  // send mail with defined transport object
  const emailResponse = await transporter.sendMail({
    subject,
    from: `"${name}" <${from}>`,
    to,
    html: msg
  })

  return emailResponse
}

export default email
