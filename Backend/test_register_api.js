const axios = require('axios');

async function testRegister() {
    console.log('Testing duplicate email registration...');
    try {
        await axios.post('http://localhost:3000/api/auth/register', {
            name: 'Sakshi Shah',
            email: 'd24it177@charusat.edu.in',
            password: 'password123',
            role: 'jobseeker'
        });
    } catch (err) {
        console.log('Duplicate Email Error Status:', err.response?.status);
        console.log('Duplicate Email Error Data:', err.response?.data);
    }

    console.log('\nTesting recruiter registration without organization...');
    try {
        await axios.post('http://localhost:3000/api/auth/register', {
            name: 'New Recruiter',
            email: 'testrecruiter@gmail.com',
            password: 'password123',
            role: 'recruiter'
        });
    } catch (err) {
        console.log('Missing Org Error Status:', err.response?.status);
        console.log('Missing Org Error Data:', err.response?.data);
    }
}

testRegister();
