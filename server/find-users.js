// Temporary script to find all user accounts and optionally reset a password
// Run: node find-users.js
// Delete this file after use!

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n✅ Connected to MongoDB Atlas\n');

    // List all users
    const users = await User.find({}).select('name email createdAt');

    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} account(s):\n`);
      console.log('─'.repeat(60));
      users.forEach((user, i) => {
        console.log(`  ${i + 1}. Name:    ${user.name}`);
        console.log(`     Email:   ${user.email}`);
        console.log(`     Created: ${user.createdAt?.toLocaleDateString() || 'N/A'}`);
        console.log('─'.repeat(60));
      });
    }

    //To reset a password, uncomment the lines below and set the email:
    // const email = 'enter your email';
    // const newPassword = 'newPassword';
    // const user = await User.findOne({ email });
    // if (user) {
    //   user.password = newPassword;  // pre-save hook will bcrypt hash it
    //   await user.save();
    //   console.log(`\n✅ Password reset for ${email} to: ${newPassword}`);
    // } else {
    //   console.log(`\n❌ No user found with email: ${email}`);
    // }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
})();
