const axios = require('./node_modules/axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function runStatusTest() {
    const timestamp = Date.now();
    const orgsRes = await axios.get(`${API_BASE_URL}/organizations`);
    const orgId = orgsRes.data.data[0]._id;

    const recruiterRegRes = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Status Test Recruiter',
        email: `recruiter_status_${timestamp}@test.com`,
        password: 'Password123!',
        role: 'recruiter',
        organizationId: orgId
    });
    const recruiterToken = recruiterRegRes.data.token;

    const jobPostRes = await axios.post(
        `${API_BASE_URL}/jobs`,
        {
            title: `Status Test Job ${timestamp}`,
            description: 'Testing application status updates.',
            requirements: { experience: { min: 1, max: 3 }, education: ['Bachelor in CS'], skills: { required: ['React'] } },
            location: 'Bangalore',
            jobType: 'full-time',
            workMode: 'remote',
            salary: { min: 800000, max: 1200000 },
            organization: orgId
        },
        { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );
    const jobId = jobPostRes.data.data._id;

    const candidateRegRes = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Status Test Candidate',
        email: `candidate_status_${timestamp}@test.com`,
        password: 'Password123!',
        role: 'jobseeker'
    });
    const candidateToken = candidateRegRes.data.token;

    const applyRes = await axios.post(
        `${API_BASE_URL}/jobs/${jobId}/apply`,
        {},
        { headers: { Authorization: `Bearer ${candidateToken}` } }
    );
    console.log('applyRes.data:', JSON.stringify(applyRes.data, null, 2));

    // Get applicant applications via getAppliedCandidates
    const appsRes = await axios.get(
        `${API_BASE_URL}/jobs/${jobId}/applications`,
        { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );

    console.log('appsRes.data:', JSON.stringify(appsRes.data, null, 2));
    const applicationId = appsRes.data.data.applications[0]._id;
    console.log(`✅ Extracted Application ID: ${applicationId}`);

    const testStatuses = ['reviewed', 'shortlisted', 'interview', 'hired', 'rejected'];

    for (const targetStatus of testStatuses) {
        console.log(`\n🔄 Recruiter updating application status to '${targetStatus}'...`);
        const updateRes = await axios.put(
            `${API_BASE_URL}/jobs/applications/${applicationId}/status`,
            { status: targetStatus },
            { headers: { Authorization: `Bearer ${recruiterToken}` } }
        );

        if (!updateRes.data.success) {
            throw new Error(`FAIL: Status update to ${targetStatus} failed: ${updateRes.data.message}`);
        }
        console.log(`✅ SUCCESS! Application status updated to '${updateRes.data.data.status}' in DB!`);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL APPLICATION STATUS UPDATES VERIFIED WORKING 100%!');
    console.log('====================================================\n');
}

runStatusTest().catch(err => {
    console.error('❌ Status test failed:', err.response?.data || err.message);
    process.exit(1);
});
