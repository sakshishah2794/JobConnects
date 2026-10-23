const axios = require('./node_modules/axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function runVerification() {
    console.log('====================================================');
    console.log('🧪 VERIFYING ISSUE 1 (JOB VISIBILITY) & ISSUE 2 (CHAT)');
    console.log('====================================================\n');

    const timestamp = Date.now();
    
    // ----------------------------------------------------
    // 1. REGISTER NEW RECRUITER & POST JOB
    // ----------------------------------------------------
    console.log('🏢 1. Registering NEW Recruiter...');
    const recruiterEmail = `recruiter_vis_${timestamp}@test.com`;
    
    // Get organization ID
    const orgsRes = await axios.get(`${API_BASE_URL}/organizations`);
    const orgId = orgsRes.data.data[0]._id;

    const recruiterRegRes = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Test Recruiter Visibility',
        email: recruiterEmail,
        password: 'Password123!',
        role: 'recruiter',
        organizationId: orgId,
        title: 'Senior Hiring Manager'
    });

    const recruiterToken = recruiterRegRes.data.token;
    const recruiterUser = recruiterRegRes.data.user;
    const recruiterId = recruiterUser.id || recruiterUser._id;
    console.log(`✅ Recruiter registered. ID: ${recruiterId}`);

    console.log('\n💼 2. Recruiter Posting NEW Job...');
    const jobTitle = `Visibility Test Engineer ${timestamp}`;
    const jobPostRes = await axios.post(
        `${API_BASE_URL}/jobs`,
        {
            title: jobTitle,
            description: 'Automated job visibility verification job posting.',
            requirements: {
                experience: { min: 2, max: 5 },
                education: ['Bachelor in CS'],
                skills: { required: ['JavaScript', 'Node.js', 'React'] }
            },
            location: 'Remote / Bangalore',
            jobType: 'full-time',
            workMode: 'remote',
            salary: { min: 1000000, max: 1800000 },
            organization: orgId
        },
        { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );

    const postedJob = jobPostRes.data.data;
    console.log(`✅ Job Posted! ID: ${postedJob._id} | Status in DB: ${postedJob.status}`);
    if (postedJob.status !== 'active') {
        throw new Error(`FAIL: Posted job status is '${postedJob.status}', expected 'active'!`);
    }

    // ----------------------------------------------------
    // 2. REGISTER NEW CANDIDATE & VERIFY JOB VISIBILITY
    // ----------------------------------------------------
    console.log('\n👤 3. Registering NEW Candidate...');
    const candidateEmail = `candidate_vis_${timestamp}@test.com`;
    const candidateRegRes = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Test Candidate Visibility',
        email: candidateEmail,
        password: 'Password123!',
        role: 'jobseeker'
    });

    const candidateToken = candidateRegRes.data.token;
    const candidateUser = candidateRegRes.data.user;
    const candidateId = candidateUser.id || candidateUser._id;
    console.log(`✅ Candidate registered. ID: ${candidateId}`);

    console.log('\n🔍 4. Candidate Fetching Active Jobs List...');
    const candidateJobsRes = await axios.get(
        `${API_BASE_URL}/jobs`,
        { headers: { Authorization: `Bearer ${candidateToken}` } }
    );

    const candidateJobs = candidateJobsRes.data.jobs;
    const foundJob = candidateJobs.find(j => j._id === postedJob._id);

    if (!foundJob) {
        console.error('Jobs returned to candidate:', candidateJobs.map(j => ({ id: j._id, title: j.title, status: j.status })));
        throw new Error(`FAIL: Newly posted job ${postedJob._id} ('${jobTitle}') is NOT visible in candidate GET /jobs!`);
    }
    console.log(`✅ SUCCESS! Newly created job '${foundJob.title}' appears in Candidate job listing!`);

    console.log('\n🔎 5. Testing Search Filter for Newly Created Job...');
    const searchRes = await axios.get(
        `${API_BASE_URL}/jobs?search=${encodeURIComponent(jobTitle)}`,
        { headers: { Authorization: `Bearer ${candidateToken}` } }
    );
    const searchFound = searchRes.data.jobs.find(j => j._id === postedJob._id);
    if (!searchFound) {
        throw new Error(`FAIL: Search for '${jobTitle}' did not return the newly posted job!`);
    }
    console.log(`✅ SUCCESS! Search query successfully returns the newly created job!`);

    console.log('\n📄 6. Candidate Fetching Job Details...');
    const jobDetailsRes = await axios.get(
        `${API_BASE_URL}/jobs/${postedJob._id}`,
        { headers: { Authorization: `Bearer ${candidateToken}` } }
    );
    console.log(`✅ SUCCESS! Job details loaded. Recruiter ID: ${jobDetailsRes.data.job.recruiter._id}`);

    // ----------------------------------------------------
    // 3. TEST CHAT WORKFLOW BETWEEN CANDIDATE AND RECRUITER
    // ----------------------------------------------------
    console.log('\n💬 7. Candidate Sending Message to Recruiter...');
    const candidateMsgRes = await axios.post(
        `${API_BASE_URL}/chat/messages`,
        {
            recipientId: recruiterId,
            content: `Hi Recruiter, I'm interested in ${jobTitle}!`
        },
        { headers: { Authorization: `Bearer ${candidateToken}` } }
    );

    console.log(`✅ Message sent by candidate! Message ID: ${candidateMsgRes.data.data._id}`);

    console.log('\n📥 8. Recruiter Fetching Chats List...');
    const recruiterChatsRes = await axios.get(
        `${API_BASE_URL}/chat/chats`,
        { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );

    const recruiterChats = recruiterChatsRes.data.data;
    console.log(`✅ Recruiter has ${recruiterChats.length} chat(s).`);
    const chatWithCandidate = recruiterChats.find(c => 
        c.participants.some(p => (p.user._id || p.user.id || p.user) === candidateId)
    );

    if (!chatWithCandidate) {
        throw new Error('FAIL: Recruiter chat list does not contain conversation with candidate!');
    }
    console.log(`✅ Recruiter found conversation ID: ${chatWithCandidate._id}`);

    console.log('\n💬 9. Recruiter Replying to Candidate...');
    const recruiterReplyRes = await axios.post(
        `${API_BASE_URL}/chat/messages`,
        {
            recipientId: candidateId,
            content: 'Hello Candidate! Thank you for reaching out. Let us schedule an interview!'
        },
        { headers: { Authorization: `Bearer ${recruiterToken}` } }
    );

    console.log(`✅ Recruiter reply sent! Message ID: ${recruiterReplyRes.data.data._id}`);

    console.log('\n📥 10. Candidate Fetching Conversation Messages...');
    const candidateMessagesRes = await axios.get(
        `${API_BASE_URL}/chat/chats/${chatWithCandidate._id}/messages`,
        { headers: { Authorization: `Bearer ${candidateToken}` } }
    );

    const messages = candidateMessagesRes.data.data.messages;
    console.log(`✅ Conversation has ${messages.length} message(s).`);
    if (messages.length < 2) {
        throw new Error('FAIL: Expected at least 2 messages in conversation history!');
    }
    console.log(`   Message 1: [${messages[0].sender.name}]: ${messages[0].content}`);
    console.log(`   Message 2: [${messages[1].sender.name}]: ${messages[1].content}`);

    console.log('\n====================================================');
    console.log('🎉 BOTH ISSUE 1 (JOB VISIBILITY) & ISSUE 2 (CHAT) 100% VERIFIED!');
    console.log('====================================================\n');
}

runVerification().catch(err => {
    console.error('❌ Verification failed:', err.response?.data || err.message);
    process.exit(1);
});
