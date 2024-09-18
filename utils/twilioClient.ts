// utils/twilioClient.ts
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const client = twilio(accountSid, authToken);

export const sendSMS = async (to: string, body: string): Promise<void> => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log('SMS sent:', message.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};