const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');

const ATLAS_URI = 'mongodb+srv://admin:MyProjectPass123@cluster0.gq2gipo.mongodb.net/jobconnect?retryWrites=true&w=majority';

async function checkUsers() {
    await mongoose.connect(ATLAS_URI);
    const users = await User.find().sort({ createdAt: -1 }).select('name email role createdAt');
    console.log('Total users in DB:', users.length);
    console.log('Users list:');
    users.forEach(u => console.log(`- ${u.name} | ${u.email} | ${u.role} | ${u.createdAt}`));
    await mongoose.disconnect();
}

checkUsers().catch(console.error);
