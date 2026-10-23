require('dotenv').config();
const mongoose = require('mongoose');
const { sendWelcomeEmail, sendInterviewEmail, sendHiredEmail, createEmailTransporter } = require('./utils/emailService');

async function testEmail() {
    console.log('Testing Email Transporter...');
    const transporter = createEmailTransporter();
    try {
        await transporter.verify();
        console.log('✅ SMTP Transporter verification SUCCESSFUL!');
    } catch (err) {
        console.error('❌ SMTP Transporter verification FAILED:', err.message);
    }

    console.log('Testing sendHiredEmail...');
    try {
        const res = await sendHiredEmail('sakshiishah27@gmail.com', 'Sakshi Shah', 'Full Stack Developer', 'TechCorp');
        console.log('Result sendHiredEmail:', res);
    } catch (err) {
        console.error('Error sendHiredEmail:', err.message);
    }
}

testEmail().then(() => process.exit(0));
