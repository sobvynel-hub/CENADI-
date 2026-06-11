/**
 * controllers/adminController.js – Administration (super admin)
 */

const User = require('../models/User');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { parsePagination, paginatedResponse } = require('../utils/helpers');
const { ROLES } = require('../utils/constants');
const fs = require('fs');
const path = require('path');

/**
 * Récupère tous les administrateurs
 */
exports.getAllAdmins = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  
  const [admins, total] = await Promise.all([
    User.find({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } }),
  ]);
  
  res.status(200).json(paginatedResponse(admins, total, page, limit));
});

/**
 * Crée un nouvel administrateur
 */
exports.createAdmin = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  
  if (![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role)) {
    return next(new AppError('Rôle invalide', 400));
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Un utilisateur avec cet email existe déjà', 400));
  }
  
  const admin = await User.create({
    employeeId: `ADMIN${Date.now()}`,
    firstName,
    lastName,
    email,
    password,
    role,
    isActive: true,
  });
  
  admin.password = undefined;
  
  await Log.create({
    userId: req.user._id,
    action: 'ADMIN_CREATE',
    entity: 'User',
    entityId: admin._id,
    details: { email, role },
    ip: req.ip,
  });
  
  res.status(201).json({
    status: 'success',
    data: admin,
  });
});

/**
 * Met à jour un administrateur
 */
exports.updateAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { firstName, lastName, email, role, isActive } = req.body;
  
  const admin = await User.findById(id);
  if (!admin || !admin.role) {
    return next(new AppError('Administrateur non trouvé', 404));
  }
  
  if (firstName) admin.firstName = firstName;
  if (lastName) admin.lastName = lastName;
  if (email) admin.email = email;
  if (role && [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role)) admin.role = role;
  if (isActive !== undefined) admin.isActive = isActive;
  
  await admin.save();
  admin.password = undefined;
  
  await Log.create({
    userId: req.user._id,
    action: 'ADMIN_UPDATE',
    entity: 'User',
    entityId: admin._id,
    details: { email: admin.email, role: admin.role },
    ip: req.ip,
  });
  
  res.status(200).json({
    status: 'success',
    data: admin,
  });
});

/**
 * Supprime un administrateur
 */
exports.deleteAdmin = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (id === req.user._id.toString()) {
    return next(new AppError('Vous ne pouvez pas supprimer votre propre compte', 400));
  }
  
  const admin = await User.findByIdAndDelete(id);
  if (!admin) {
    return next(new AppError('Administrateur non trouvé', 404));
  }
  
  await Log.create({
    userId: req.user._id,
    action: 'ADMIN_DELETE',
    entity: 'User',
    entityId: admin._id,
    details: { email: admin.email },
    ip: req.ip,
  });
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Configuration plateforme (à stocker dans une collection Settings)
let settingsCache = {
  appName: 'CENADI Formation',
  contactEmail: 'contact@cenadi.com',
  maintenanceMode: false,
};

exports.getSettings = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: settingsCache,
  });
});

exports.updateSettings = catchAsync(async (req, res, next) => {
  const { appName, contactEmail, maintenanceMode } = req.body;
  if (appName) settingsCache.appName = appName;
  if (contactEmail) settingsCache.contactEmail = contactEmail;
  if (maintenanceMode !== undefined) settingsCache.maintenanceMode = maintenanceMode;
  
  await Log.create({
    userId: req.user._id,
    action: 'SETTINGS_UPDATE',
    entity: 'Settings',
    details: settingsCache,
    ip: req.ip,
  });
  
  res.status(200).json({
    status: 'success',
    data: settingsCache,
  });
});

/**
 * Récupère les logs système
 */
exports.getLogs = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { action, entity, userId } = req.query;
  
  const filter = {};
  if (action) filter.action = action;
  if (entity) filter.entity = entity;
  if (userId) filter.userId = userId;
  
  const [logs, total] = await Promise.all([
    Log.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Log.countDocuments(filter),
  ]);
  
  res.status(200).json(paginatedResponse(logs, total, page, limit));
});

/**
 * Exporte les logs en CSV
 */
exports.exportLogs = catchAsync(async (req, res, next) => {
  const logs = await Log.find({})
    .populate('userId', 'email')
    .sort({ createdAt: -1 })
    .limit(10000);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=logs.csv');
  
  const csvRows = [['Date', 'Utilisateur', 'Action', 'Entité', 'IP']];
  
  for (const log of logs) {
    csvRows.push([
      log.createdAt.toISOString(),
      log.userId?.email || 'Système',
      log.action,
      log.entity || '-',
      log.ip || '-',
    ]);
  }
  
  res.send(csvRows.map(row => row.join(',')).join('\n'));
});

/**
 * Crée une sauvegarde manuelle
 */
exports.createBackup = catchAsync(async (req, res, next) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(__dirname, '../backups', `backup-${timestamp}.json`);
  
  // Récupérer toutes les données
  const users = await User.find({}).select('-password');
  const formations = await Formation.find({});
  const enrollments = await Enrollment.find({});
  const certificates = await Certificate.find({});
  
  const backupData = {
    timestamp: new Date().toISOString(),
    users,
    formations,
    enrollments,
    certificates,
  };
  
  if (!fs.existsSync(path.join(__dirname, '../backups'))) {
    fs.mkdirSync(path.join(__dirname, '../backups'), { recursive: true });
  }
  
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  
  await Log.create({
    userId: req.user._id,
    action: 'BACKUP_CREATE',
    details: { path: backupPath },
    ip: req.ip,
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Sauvegarde créée',
    file: backupPath,
  });
});