# CENADI FORMATION - Application de Gestion des Formations

## 📋 Table des matières
1. [Aperçu](#aperçu)
2. [Architecture](#architecture)
3. [Prérequis](#prérequis)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Démarrage en développement](#démarrage-en-développement)
7. [Déploiement](#déploiement)
8. [Documentation API](#documentation-api)
9. [Dépannage](#dépannage)

---

## 🎯 Aperçu

CENADI FORMATION est une plateforme web complète de gestion des formations pour l'entreprise CENADI. Elle permet de:

- **Visiteurs**: Consulter les formations publiques
- **Administrateurs**: Gérer complètement les formations, inscriptions, présences et attestations
- **Super Administrateurs**: Gérer les admins, configuration, logs et sauvegardes

### Fonctionnalités principales
- ✅ Authentification JWT sécurisée
- ✅ Gestion CRUD des formations
- ✅ Gestion des inscriptions et présences
- ✅ Génération d'attestations PDF avec QR code
- ✅ Recherche globale avancée
- ✅ Statistiques et rapports
- ✅ Support formations personnelles (à frais)
- ✅ Import/Export CSV
- ✅ Système de logs et audit

---

## 🏗️ Architecture

### Frontend (React 18 + Vite)
```
client/
├── src/
│   ├── api/          → Clients API Axios
│   ├── components/   → Composants réutilisables
│   ├── pages/        → Pages (publiques + admin)
│   ├── hooks/        → Hooks personnalisés
│   ├── context/      → Context API (Auth, Theme)
│   ├── utils/        → Utilitaires et constantes
│   └── routes/       → Configuration des routes
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### Backend (Node.js + Express + MongoDB)
```
server/
├── models/           → Schémas Mongoose (User, Formation, etc.)
├── controllers/      → Logique métier
├── routes/           → Définition des endpoints
├── middleware/       → Auth, validation, error handling
├── services/         → Email, PDF, QR code
├── validations/      → Validation des données
├── utils/            → Utilitaires (AppError, logger, etc.)
├── config/           → Configuration (DB, Cloudinary, SMTP)
├── scripts/          → Seed et import
├── logs/             → Fichiers de logs
└── uploads/          → Fichiers uploadés
```

---

## 📦 Prérequis

### Système
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 4.4 (local ou Atlas)
- **Git**

### Comptes externes (optionnels pour développement)
- **Gmail** - Pour l'envoi d'emails
- **Cloudinary** - Pour le stockage d'images (optionnel)
- **MongoDB Atlas** - Pour la base de données en production

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/cenadi/gestion-formation-cenadi.git
cd gestion-formation-cenadi
```

### 2. Installation Frontend
```bash
cd client
npm install
```

### 3. Installation Backend
```bash
cd ../server
npm install
```

---

## ⚙️ Configuration

### 1. Variables d'environnement Frontend (client/.env)
```env
VITE_APP_TITLE=Gestion Formations CENADI
VITE_API_BASE_URL=http://localhost:5000
VITE_THEME=system
VITE_PUBLIC_URL=/
```

### 2. Variables d'environnement Backend (server/.env)
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cenadi
# Ou pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/cenadi

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-chars-change-in-production
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (Gmail avec App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Générer une clé JWT sécurisée

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Utilisez le résultat pour `JWT_SECRET` dans le `.env` backend.

---

## 🎮 Démarrage en développement

### Terminal 1 - Backend
```bash
cd server
npm run dev
# Le serveur démarrera sur http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
# Le frontend démarrera sur http://localhost:5173
```

### Initialiser la base de données
```bash
cd server
npm run seed
# Crée divisions, utilisateurs et formations de test
```

### Utilisateurs de test
- **Admin**
  - Email: `alphonse.mbarga@cenadi.cm`
  - Password: `password123`

- **Super Admin**
  - Email: `super.admin@cenadi.cm`
  - Password: `password123`

---

## 🌍 API Endpoints Principaux

### Authentification
```
POST   /api/auth/login              - Connexion
POST   /api/auth/logout             - Déconnexion
GET    /api/auth/me                 - Profil actuel
PUT    /api/auth/change-password    - Changer mot de passe
```

### Formations
```
GET    /api/formations/upcoming     - Formations à venir (public)
GET    /api/formations/past         - Formations passées (public)
GET    /api/formations/:id          - Détail formation
GET    /api/formations              - Tous (admin)
POST   /api/formations              - Créer
PUT    /api/formations/:id          - Mettre à jour
DELETE /api/formations/:id          - Supprimer
PATCH  /api/formations/:id/status   - Changer statut
```

### Utilisateurs
```
GET    /api/users                   - Liste (admin)
POST   /api/users                   - Créer
GET    /api/users/:id               - Détail
PUT    /api/users/:id               - Mettre à jour
DELETE /api/users/:id               - Supprimer
POST   /api/users/import            - Import CSV
GET    /api/users/export            - Export CSV
GET    /api/users/:id/history       - Historique employé
```

### Inscriptions
```
GET    /api/enrollments             - Toutes
POST   /api/enrollments             - Créer
PATCH  /api/enrollments/:id/status  - Changer statut
DELETE /api/enrollments/:id         - Annuler
GET    /api/enrollments/export/formation/:id - Export CSV
```

### Présences
```
GET    /api/attendances/formation/:id      - Présences formation
PATCH  /api/attendances/:id                - Marquer présence
GET    /api/attendances/qrcode/generate/:id - Générer QR code
POST   /api/attendances/qrcode/:id         - Scanner QR code
```

### Attestations
```
GET    /api/certificates            - Toutes
POST   /api/certificates/generate/:id - Générer
POST   /api/certificates/:id/send   - Envoyer par email
GET    /api/certificates/:id/download - Télécharger PDF
```

### Formations Personnelles
```
GET    /api/personal-trainings      - Toutes (super admin)
POST   /api/personal-trainings      - Soumettre (employé)
PATCH  /api/personal-trainings/:id/status - Approuver/Refuser
```

### Recherche & Stats
```
GET    /api/search/global           - Recherche globale
GET    /api/stats/dashboard         - Statistiques dashboard
GET    /api/stats/formations        - Stats formations
GET    /api/stats/enrollments       - Stats inscriptions
```

### Admin (Super Admin uniquement)
```
GET    /api/admin/admins            - Liste admins
POST   /api/admin/admins            - Créer admin
PUT    /api/admin/admins/:id        - Mettre à jour
DELETE /api/admin/admins/:id        - Supprimer
GET    /api/admin/settings          - Paramètres
PUT    /api/admin/settings          - Mettre à jour
GET    /api/admin/logs              - Logs système
POST   /api/admin/backup            - Sauvegarder BDD
```

---

## 📊 Collection Postman

### Importer la collection
1. Ouvrir Postman
2. Cliquer sur **Import**
3. Charger le fichier: `postman-collection.json` (voir section Collections)

### Variables Postman
```json
{
  "base_url": "http://localhost:5000",
  "api_token": "obtenu après login",
  "formation_id": "ID d'une formation",
  "user_id": "ID d'un utilisateur"
}
```

---

## 🏭 Build pour Production

### Frontend
```bash
cd client
npm run build
# Génère: dist/
```

### Backend
```bash
# Aucun build requis (Node.js)
# Simplement déployer le répertoire server/
```

---

## 🚢 Déploiement

### Backend (Exemple avec Heroku)
```bash
# 1. Créer une application Heroku
heroku create cenadi-formation-api

# 2. Configurer les variables
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
heroku config:set EMAIL_USER=...
heroku config:set EMAIL_PASS=...

# 3. Déployer
git push heroku main
```

### Frontend (Exemple avec Vercel)
```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Déployer
cd client
vercel
```

### Variables Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pwd@cluster.mongodb.net/cenadi
JWT_SECRET=<nouvelle-clé-sécurisée>
FRONTEND_URL=https://cenadi-formation.com
EMAIL_HOST=<votre-provider>
```

---

## 🐛 Dépannage

### Erreur: "Connection refused" MongoDB
```bash
# Vérifier si MongoDB fonctionne
mongosh
# Ou si MongoDB n'est pas installé, utiliser MongoDB Atlas
```

### Erreur: "Port 5000 already in use"
```bash
# Changer le port dans .env
PORT=5001
```

### Erreur: CORS lors de l'appel API
```
# Vérifier FRONTEND_URL dans server/.env
FRONTEND_URL=http://localhost:5173
```

### Erreur: "JWT token expired"
```
# Renouveler le token via POST /api/auth/refresh-token
# Ou se reconnecter
```

### Emails ne s'envoient pas
```
# Vérifier configuration Gmail:
# 1. Activer "Accès applications moins sécurisées"
# 2. Ou générer une "App Password"
# 3. Vérifier EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
```

---

## 📝 Modèles de Données

### User
```javascript
{
  employeeId: String (unique),
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashé),
  division: String,
  role: "admin" | "super_admin" | null,
  phone: String,
  position: String,
  profilePicture: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Formation
```javascript
{
  title: String,
  slug: String (unique),
  description: String,
  objectives: String,
  program: String (HTML),
  prerequisites: [String],
  trainer: String,
  trainerBio: String,
  startDate: Date,
  endDate: Date,
  location: String,
  maxCapacity: Number,
  currentEnrolled: Number,
  targetDivisions: [String],
  status: "upcoming" | "ongoing" | "completed" | "cancelled",
  isPublic: Boolean,
  coverImage: String,
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollment
```javascript
{
  userId: ObjectId (User),
  formationId: ObjectId (Formation),
  registrationDate: Date,
  status: "pending" | "confirmed" | "rejected" | "cancelled",
  attended: Boolean,
  attendanceDate: Date,
  certificateIssued: Boolean,
  certificateUrl: String,
  certificateIssuedDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Certificate
```javascript
{
  userId: ObjectId (User),
  formationId: ObjectId (Formation),
  personalTrainingId: ObjectId (PersonalTraining),
  source: "enterprise" | "personal",
  certificateNumber: String (unique),
  issueDate: Date,
  fileUrl: String,
  isIssued: Boolean,
  emailSent: Boolean,
  emailSentAt: Date,
  issuedBy: ObjectId (User),
  createdAt: Date
}
```

---

## 🔒 Sécurité

### Bonnes pratiques implémentées
- ✅ Authentification JWT
- ✅ Hashage bcrypt (10 rounds)
- ✅ Protection CORS
- ✅ Rate limiting (100 req/15 min)
- ✅ Validation express-validator
- ✅ Protection XSS (xss-clean)
- ✅ Protection injection MongoDB (mongo-sanitize)
- ✅ Headers de sécurité (Helmet)
- ✅ Compression réponses

### À faire en production
- [ ] Utiliser HTTPS (SSL/TLS)
- [ ] Configurer authentification 2FA
- [ ] Audit de sécurité régulière
- [ ] Backup automatique de la BDD
- [ ] Monitoring des logs
- [ ] Rate limiting renforcé
- [ ] Secrets gérés (HashiCorp Vault, AWS Secrets Manager)

---

## 📚 Ressources Supplémentaires

- [Documentation React](https://react.dev)
- [Documentation Express](https://expressjs.com)
- [Documentation MongoDB](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 👥 Support

Pour des questions ou problèmes:
1. Consulter ce README
2. Vérifier les logs: `server/logs/cenadi.log`
3. Contacter l'équipe CENADI

---

## 📄 Licence

© 2024 CENADI. Tous droits réservés.

---

## ✅ Checklist Démarrage

- [ ] Node.js et npm installés
- [ ] MongoDB en fonctionnement
- [ ] `npm install` exécuté (client + server)
- [ ] `.env` rempli (backend)
- [ ] `npm run seed` exécuté
- [ ] Backend démarré: `npm run dev` (dans server/)
- [ ] Frontend démarré: `npm run dev` (dans client/)
- [ ] Accès http://localhost:5173
- [ ] Connexion test réussie
- [ ] API responsive

---

**Dernière mise à jour**: 2024
**Version**: 1.0.0
