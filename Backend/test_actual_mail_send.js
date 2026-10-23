require('dotenv').config();
const nodemailer = require('nodemailer');
const { createEmailTransporter, sendRejectedEmail, sendHiredEmail } = require('./utils/emailService');

async function testMailDetailed() {
    const transporter = createEmailTransporter();
    
    console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
    console.log('Sending test email to sakshiishah27@gmail.com...');

    const mailOptions = {
        from: `"JobConnect Portal" <${process.env.EMAIL_USER}>`,
        to: 'sakshiishah27@gmail.com',
        subject: 'JobConnect Test Notification - Status Update',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
                <h2 style="color: #2563eb;">JobConnect Test Email</h2>
                <p>Hello Sakshi,</p>
                <p>This is a test notification for your job application on JobConnect.</p>
                <p>Time sent: ${new Date().toISOString()}</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ SendMail Response:');
        console.log('Message ID:', info.messageId);
        console.log('Accepted Recipients:', info.accepted);
        console.log('Rejected Recipients:', info.rejected);
        console.log('SMTP Server Response:', info.response);
    } catch (err) {
        console.error('❌ SendMail Failed:', err);
    }
}

testMailDetailed().then(() => process.exit(0));
