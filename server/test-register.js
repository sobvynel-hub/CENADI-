const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/cenadi_db');

const User = require('./models/User');

async function test() {
  try {
    const user = await User.create({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'test-register@cenadi.cm',
      password: '123456',
      division: 'DSI',
      employeeId: 'EMP-TEST-123',
      isActive: true
    });
    console.log('✅ Utilisateur créé avec succès!');
    console.log('ID:', user._id);
    console.log('Email:', user.email);
  } catch (err) {
    console.log('❌ Erreur de création:', err.message);
    console.log('Détails:', err.errors);
  }
  process.exit();
}

test();