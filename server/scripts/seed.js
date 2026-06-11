/**
 * scripts/seed.js – Insertion des données initiales
 * Exécution: node scripts/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Modèles
const User = require('../models/User');
const Division = require('../models/Division');
const Formation = require('../models/Formation');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const PersonalTraining = require('../models/PersonalTraining');
const Log = require('../models/Log');

const divisions = [
  { name: 'Direction Générale', code: 'DG', budget: 5000000, description: 'Direction générale de l\'entreprise' },
  { name: 'Direction des Systèmes d\'Information', code: 'DSI', budget: 8000000, description: 'Gestion des systèmes informatiques' },
  { name: 'Ressources Humaines', code: 'RH', budget: 3000000, description: 'Gestion des ressources humaines' },
  { name: 'Finance et Comptabilité', code: 'FIN', budget: 4000000, description: 'Gestion financière' },
  { name: 'Marketing et Communication', code: 'MKT', budget: 2500000, description: 'Marketing et communication' },
  { name: 'Commercial', code: 'COM', budget: 3500000, description: 'Service commercial' },
];

const formations = [
  {
    title: 'Excel Avancé - Analyse de données',
    slug: 'excel-avance-analyse-donnees',
    description: 'Maîtrisez les fonctionnalités avancées d\'Excel pour l\'analyse de données professionnelles',
    objectives: 'Utiliser les tableaux croisés dynamiques, créer des macros VBA, automatiser des tâches répétitives',
    program: '<h3>Module 1</h3><p>Tableaux croisés dynamiques et graphiques croisés</p><h3>Module 2</h3><p>Formules avancées et fonctions matricielles</p><h3>Module 3</h3><p>Introduction aux macros VBA</p>',
    prerequisites: ['Connaissances de base Excel', 'Notions de tableurs'],
    trainer: 'Jean Dupont',
    trainerBio: 'Expert Excel certifié avec 10 ans d\'expérience en formation',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
    location: 'Salle de formation A - 1er étage',
    maxCapacity: 20,
    targetDivisions: ['DSI', 'FIN', 'COM'],
    status: 'upcoming',
    isPublic: true,
  },
  {
    title: 'Management d\'équipe et Leadership',
    slug: 'management-equipe-leadership',
    description: 'Développez vos compétences en leadership et gestion d\'équipe',
    objectives: 'Communiquer efficacement, gérer les conflits, motiver son équipe, déléguer',
    program: '<h3>Module 1</h3><p>Fondamentaux du management</p><h3>Module 2</h3><p>Communication non-violente</p><h3>Module 3</h3><p>Gestion des conflits et médiation</p>',
    prerequisites: ['Expérience en management (débutant accepté)'],
    trainer: 'Marie Lambert',
    trainerBio: 'Coach certifiée en leadership, ancienne DRH',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 57 * 24 * 60 * 60 * 1000),
    location: 'Salle de conférence - RDC',
    maxCapacity: 15,
    targetDivisions: ['DG', 'RH', 'COM'],
    status: 'completed',
    isPublic: true,
  },
  {
    title: 'Cybersécurité - Bonnes pratiques',
    slug: 'cybersecurite-bonnes-pratiques',
    description: 'Sensibilisation à la sécurité informatique pour tous les employés',
    objectives: 'Identifier les menaces, adopter les bonnes pratiques, protéger les données sensibles',
    program: '<h3>Module 1</h3><p>Les risques numériques</p><h3>Module 2</h3><p>Mots de passe et authentification</p><h3>Module 3</h3><p>Phishing et ingénierie sociale</p>',
    prerequisites: [],
    trainer: 'Sébastien Kamga',
    trainerBio: 'Expert en sécurité informatique, certifié CISSP',
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    location: 'Salle polyvalente - 2ème étage',
    maxCapacity: 30,
    targetDivisions: ['DSI', 'RH', 'FIN', 'COM', 'MKT'],
    status: 'upcoming',
    isPublic: true,
  },
];

const demoUsers = [
  {
    employeeId: 'CEN-ADMIN-001',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'super@cenadi.cm',
    password: 'Admin123456!',
    division: 'Direction Générale',
    role: 'super_admin',
    isActive: true,
  },
  {
    employeeId: 'CEN-ADMIN-002',
    firstName: 'Jean',
    lastName: 'Admin',
    email: 'admin@cenadi.cm',
    password: 'Admin123456!',
    division: 'Direction des Systèmes d\'Information',
    role: 'admin',
    isActive: true,
  },
  {
    employeeId: 'CEN-EMP-000',
    firstName: 'Employé',
    lastName: 'Démo',
    email: 'employe@cenadi.cm',
    password: 'Admin123456!',
    division: 'Direction des Systèmes d\'Information',
    position: 'Personnel',
    phone: '+237 6XX XXX XXX',
    isActive: true,
  },
  {
    employeeId: 'CEN-EMP-001',
    firstName: 'Paul',
    lastName: 'Ndjock',
    email: 'paul.ndjock@cenadi.cm',
    password: 'Temp123456!',
    division: 'Direction des Systèmes d\'Information',
    position: 'Développeur Senior',
    phone: '+237 6XX XXX XXX',
    isActive: true,
  },
  {
    employeeId: 'CEN-EMP-002',
    firstName: 'Marie',
    lastName: 'Essomba',
    email: 'marie.essomba@cenadi.cm',
    password: 'Temp123456!',
    division: 'Ressources Humaines',
    position: 'Chargée de formation',
    phone: '+237 6XX XXX XXX',
    isActive: true,
  },
];

async function seed() {
  console.log('🌱 Début du seed des données initiales...\n');
  
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Nettoyer les collections
    await User.deleteMany();
    await Division.deleteMany();
    await Formation.deleteMany();
    await Enrollment.deleteMany();
    await Certificate.deleteMany();
    await PersonalTraining.deleteMany();
    await Log.deleteMany();
    console.log('🗑️ Collections nettoyées');

    // Insérer les divisions
    const createdDivisions = await Division.insertMany(divisions);
    console.log(`📁 ${createdDivisions.length} divisions créées`);

    // Créer les utilisateurs
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      const roleIcon = user.role === 'super_admin' ? '👑' : (user.role === 'admin' ? '🛡️' : '👤');
      console.log(`${roleIcon} Utilisateur créé: ${user.email} (${user.role || 'employé'})`);
    }

    // Insérer les formations
    const createdFormations = await Formation.insertMany(formations);
    console.log(`📚 ${createdFormations.length} formations créées`);

    console.log('\n🎉 Seed terminé avec succès !');
    console.log('\n📋 Récapitulatif des comptes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Super Admin:   super@cenadi.cm / Admin123456!');
    console.log('🛡️ Admin:         admin@cenadi.cm / Admin123456!');
    console.log('👤 Personnel:      employe@cenadi.cm / Admin123456!');
    console.log('👤 Employé DSI:   paul.ndjock@cenadi.cm / Temp123456!');
    console.log('👤 Employé RH:    marie.essomba@cenadi.cm / Temp123456!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

// Exécution
seed();