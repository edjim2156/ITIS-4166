const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/user');

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    await User.deleteMany({});
    console.log('Existing users deleted');

    const users = [
      {
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin',
        role: 'admin',
      },
      {
        username: 'dummy',
        firstName: 'Dummy',
        lastName: 'User',
        email: 'dummy@example.com',
        password: 'dummy',
        role: 'user',
      },
    ];

    for (const data of users) {
      const user = new User(data);
      await user.save();
      console.log(`Created: ${user.email} (${user.role})`);
    }

    console.log('Users seeded successfully.');
    process.exit();
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
}

seedUsers();