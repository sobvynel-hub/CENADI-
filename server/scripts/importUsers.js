/**
 * scripts/importUsers.js – Import d'employés depuis CSV
 * Exécution: node scripts/importUsers.js --file=../uploads/employes.csv
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Récupérer le chemin du fichier depuis les arguments
const fileArg = process.argv.find(arg => arg.startsWith('--file='));
const filePath = fileArg ? fileArg.split('=')[1] : null;

if (!filePath) {
  console.error('❌ Veuillez spécifier le fichier CSV: node scripts/importUsers.js --file=chemin/fichier.csv');
  console.error('Exemple: node scripts/importUsers.js --file=./uploads/employes.csv');
  process.exit(1);
}

const resolvedPath = path.resolve(__dirname, filePath);

async function importUsers() {
  console.log('📂 Début de l\'import des utilisateurs...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si le fichier existe
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ Fichier non trouvé: ${resolvedPath}`);
      process.exit(1);
    }

    const results = [];
    const errors = [];

    const stream = fs.createReadStream(resolvedPath)
      .pipe(csv.parse({ headers: true, trim: true }));

    await new Promise((resolve, reject) => {
      stream
        .on('data', (row) => results.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📄 ${results.length} lignes trouvées dans le fichier\n`);

    for (const row of results) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ 
          $or: [{ email: row.email }, { employeeId: row.employeeId }] 
        });
        
        if (existingUser) {
          errors.push({ row, error: 'Email ou matricule déjà existant' });
          console.log(`⚠️ Déjà existant: ${row.firstName} ${row.lastName} (${row.email})`);
          continue;
        }

        const hashedPassword = await bcrypt.hash('Temp123456!', 10);
        
        await User.create({
          employeeId: row.employeeId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          password: hashedPassword,
          division: row.division || null,
          position: row.position || null,
          phone: row.phone || null,
          isActive: true,
        });
        
        console.log(`✅ Importé: ${row.firstName} ${row.lastName} (${row.email})`);
      } catch (err) {
        errors.push({ row, error: err.message });
        console.error(`❌ Erreur pour ${row.email}: ${err.message}`);
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ Succès: ${results.length - errors.length}`);
    console.log(`   ❌ Erreurs: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log(`\n📝 Détail des erreurs:`);
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.row.email || 'inconnu'} - ${err.error}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    process.exit(1);
  }
}

importUsers();