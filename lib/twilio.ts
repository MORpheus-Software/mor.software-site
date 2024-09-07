// lib/twilio.ts
import { Twilio } from 'twilio';
import sgMail from '@sendgrid/mail';

const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendSMS(to: string, message: string) {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log('SMS sent successfully');
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}

// export async function sendEmail(to: string, subject: string, text: string, html?: string) {
//   try {
//     const msg = {
//       to,
//       from: process.env.SENDGRID_EMAIL, // Your verified sender email
//       subject,
//       text,
//       html,
//     };
//     await sgMail.send(msg);
//     console.log('Email sent successfully');
//   } catch (error) {
//     console.error('Failed to send email:', error);
//   }
// }
