  import nodemailer from 'nodemailer'
  import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from '../config'

  export const sendEmail = async (to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: `"Your App" <${SMTP_USER}>`,
      to,
      subject,
      html
    })
  }