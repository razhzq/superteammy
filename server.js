import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Initialize Nodemailer transporter
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
  console.log('✅ Email transporter initialized');
} else {
  console.warn('⚠️  EMAIL_USER or EMAIL_APP_PASSWORD not found in environment variables');
}

app.use(cors());
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { recipients, subject, message } = req.body;

  if (!recipients || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!transporter) {
    return res.status(500).json({ error: 'Email service not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD in .env' });
  }

  console.log(`📧 Sending emails to ${recipients.length} recipients:`, recipients.map(r => r.email));

  try {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        console.log(`  → Sending to ${recipient.email}...`);
        
        const mailOptions = {
          from: `"Dentistry School" <${process.env.EMAIL_USER}>`,
          to: recipient.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Hello ${recipient.name},</h2>
              <div style="white-space: pre-wrap; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="color: #666; font-size: 12px;">
                This email was sent from Dentistry School Student Management System
              </p>
            </div>
          `,
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`  ✓ Sent to ${recipient.email}:`, info.messageId);
        results.push({ email: recipient.email, success: true, messageId: info.messageId });
      } catch (err) {
        console.error(`  ✗ Failed to send to ${recipient.email}:`, err.message);
        results.push({ email: recipient.email, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`📊 Results: ${successCount} sent, ${failedCount} failed`);

    return res.status(200).json({ 
      success: true, 
      count: successCount,
      failed: failedCount,
      details: results
    });
  } catch (error) {
    console.error('❌ Email send error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send emails' });
  }
});

app.post('/api/send-whatsapp', async (req, res) => {
  const { recipients, message } = req.body;

  if (!recipients || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const WATI_API_KEY = process.env.WATI_API_KEY;
  const WATI_API_URL = process.env.WATI_API_URL || 'https://live-server-XXXXX.wati.io';

  if (!WATI_API_KEY) {
    return res.status(500).json({ error: 'WATI API key not configured' });
  }

  try {
    let sent = 0;
    let failed = 0;

    // Send WhatsApp messages via WATI API
    for (const recipient of recipients) {
      try {
        // Format phone number (remove + and spaces)
        const phone = recipient.phone.replace(/[^0-9]/g, '');
        
        // Personalize message
        const personalizedMessage = message.replace(/\{\{name\}\}/g, recipient.name);

        const response = await fetch(`${WATI_API_URL}/api/v1/sendSessionMessage/${phone}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${WATI_API_KEY}`,
          },
          body: JSON.stringify({
            messageText: personalizedMessage,
          }),
        });

        if (response.ok) {
          sent++;
        } else {
          failed++;
          console.error(`Failed to send to ${phone}:`, await response.text());
        }
      } catch (err) {
        failed++;
        console.error(`Error sending to ${recipient.phone}:`, err);
      }
    }

    return res.status(200).json({ success: true, sent, failed });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send WhatsApp messages' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
