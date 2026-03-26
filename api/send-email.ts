import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { recipients, subject, message } = req.body;

  if (!recipients || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send individual emails to each recipient
    const promises = recipients.map((recipient: { email: string; name: string }) =>
      resend.emails.send({
        from: 'Dentistry School <onboarding@resend.dev>', // Change this to your verified domain
        to: recipient.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${recipient.name},</h2>
            <div style="white-space: pre-wrap; line-height: 1.6;">
              ${message}
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">
              This email was sent from Dentistry School Student Management System
            </p>
          </div>
        `,
      })
    );

    await Promise.all(promises);

    return res.status(200).json({ success: true, count: recipients.length });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send emails' });
  }
}
