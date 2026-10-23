require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const JobPost = require('./models/JobPost');
const Application = require('./models/Application');
const Organization = require('./models/Organizations');

async function testStatusAndEmails() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobconnect');
    console.log('Connected to MongoDB');

    // Find an application
    const app = await Application.findOne().populate('job').populate('applicant');
    if (!app) {
        console.log('No application found in DB');
        return;
    }

    console.log('Found application:', app._id, 'Applicant:', app.applicant.email, 'Job:', app.job.title, 'Status:', app.status);
    console.log('Job Recruiter:', app.job.recruiter);

    // Check recruiter user
    const recruiterUser = await User.findById(app.job.recruiter);
    console.log('Recruiter email:', recruiterUser?.email);
}

testStatusAndEmails().then(() => mongoose.disconnect());
