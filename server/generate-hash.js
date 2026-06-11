const bcrypt = require('bcryptjs');

const password = 'Admin123456!';

bcrypt.hash(password, 10).then(hash => {
  console.log('Mot de passe:', password);
  console.log('Hash à copier:', hash);
  console.log('\nCopiez ce hash dans MongoDB Compass !');
});