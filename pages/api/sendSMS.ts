// pages/api/sendSMS.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { sendSMS } from '../../utils/twilioClient'; // Adjust the path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phoneNumber, message } = req.body;

    try {
      await sendSMS(phoneNumber, message);
      res.status(200).json({ success: true, message: 'SMS sent successfully!' });
    } catch (error) {
      console.error('Error sending SMS:', error);
      res.status(500).json({ success: false, error: 'Failed to send SMS.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
