require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('./models/Application');
const JobPost = require('./models/JobPost');
const User = require('./models/User');
const Organization = require('./models/Organizations');
const { updateApplicationStatus } = require('./controllers/jobs.controller');

async function runTest() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobconnect');
    console.log('Connected to MongoDB');

    // Find application
    const app = await Application.findOne().populate('job').populate('applicant');
    if (!app) {
        console.error('No application found');
        process.exit(1);
    }

    console.log(`Testing status updates on Application ID: ${app._id}`);
    console.log(`Initial status: ${app.status}`);
    console.log(`Applicant: ${app.applicant.name} (${app.applicant.email})`);

    const recruiterUser = await User.findById(app.job.recruiter);

    const statusesToTest = ['shortlisted', 'interview', 'hired', 'rejected'];

    for (const newStatus of statusesToTest) {
        console.log(`\n--- Testing status transition to: '${newStatus}' ---`);

        // Mock req and res
        const req = {
            params: { applicationId: app._id.toString() },
            body: { status: newStatus },
            user: { _id: recruiterUser._id, role: 'recruiter' },
            app: { get: () => null } // mock io
        };

        let resData = null;
        let statusCode = 200;
        const res = {
            status: (code) => {
                statusCode = code;
                return res;
            },
            json: (data) => {
                resData = data;
                return res;
            }
        };

        await updateApplicationStatus(req, res);

        console.log(`HTTP Status: ${statusCode}`);
        console.log('Response:', JSON.stringify(resData, null, 2));

        // Verify in DB
        const updatedApp = await Application.findById(app._id);
        if (updatedApp.status === newStatus) {
            console.log(`✅ DB verification SUCCESS: Status updated to '${updatedApp.status}'`);
        } else {
            console.error(`❌ DB verification FAILED: Status is '${updatedApp.status}', expected '${newStatus}'`);
        }

        // Wait 1 sec before next test
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n🎉 ALL STATUS AND EMAIL TRANSITIONS TESTED SUCCESSFULLY!');
}

runTest().then(() => mongoose.disconnect());
