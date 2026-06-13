const bcrypt = require('bcryptjs');
const { User } = require('../src/models');
const { connectDB } = require('../src/config/database');
require('dotenv').config();

const password = 'admin123';

const resetPasswords = async () => {
  try {
    await connectDB();
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    console.log('New password hash:', hash);

    const [affectedRows] = await User.update(
      { password: hash },
      { where: {} }
    );
    console.log(`Updated ${affectedRows} users with password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetPasswords();
