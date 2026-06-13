const bcrypt = require('bcryptjs');

const password = 'admin123';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Hash:', hash);
console.log('SQL:');
console.log(`UPDATE users SET password = '${hash}' WHERE id IN (1,2,3,4,5);`);
