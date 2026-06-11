/**
 * controllers/searchController.js – Moteur de recherche global
 */

const Formation = require('../models/Formation');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const PersonalTraining = require('../models/PersonalTraining');
const catchAsync = require('../utils/catchAsync');

/**
 * Recherche publique sur les formations (visiteur)
 */
exports.searchPublicFormations = catchAsync(async (req, res, next) => {
  const { q, limit = 20 } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(200).json({
      status: 'success',
      data: [],
    });
  }
  
  const formations = await Formation.find({
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { trainer: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
    ],
    isPublic: true,
  })
    .limit(parseInt(limit))
    .sort({ startDate: 1 });
  
  res.status(200).json({
    status: 'success',
    data: formations,
  });
});

/**
 * Recherche globale (admin)
 */
exports.globalSearch = catchAsync(async (req, res, next) => {
  const { q, type, limit = 20 } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(200).json({
      status: 'success',
      data: { formations: [], users: [], certificates: [], personalTrainings: [] },
    });
  }
  
  const results = {};
  const limitNum = parseInt(limit);
  
  // Recherche formations
  if (!type || type === 'formations') {
    results.formations = await Formation.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { trainer: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ],
    }).limit(limitNum);
  }
  
  // Recherche utilisateurs
  if (!type || type === 'users') {
    results.users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } },
        { division: { $regex: q, $options: 'i' } },
      ],
    }).limit(limitNum);
  }
  
  // Recherche attestations
  if (!type || type === 'certificates') {
    results.certificates = await Certificate.find({
      certificateNumber: { $regex: q, $options: 'i' },
    })
      .populate('userId', 'firstName lastName email')
      .limit(limitNum);
  }
  
  // Recherche déclarations personnelles
  if (!type || type === 'personalTrainings') {
    results.personalTrainings = await PersonalTraining.find({
      $or: [
        { trainingName: { $regex: q, $options: 'i' } },
        { provider: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('userId', 'firstName lastName email')
      .limit(limitNum);
  }
  
  res.status(200).json({
    status: 'success',
    data: results,
  });
});

/**
 * Recherche spécifique formations (admin)
 */
exports.searchFormations = catchAsync(async (req, res, next) => {
  const { q, status, division, limit = 50 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (division) filter.targetDivisions = division;
  if (q && q.length >= 2) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { trainer: { $regex: q, $options: 'i' } },
    ];
  }
  
  const formations = await Formation.find(filter)
    .limit(parseInt(limit))
    .sort({ startDate: -1 });
  
  res.status(200).json({
    status: 'success',
    data: formations,
  });
});

/**
 * Recherche spécifique utilisateurs (admin)
 */
exports.searchUsers = catchAsync(async (req, res, next) => {
  const { q, division, role, limit = 50 } = req.query;
  
  const filter = {};
  if (division) filter.division = division;
  if (role) filter.role = role;
  if (q && q.length >= 2) {
    filter.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { employeeId: { $regex: q, $options: 'i' } },
    ];
  }
  
  const users = await User.find(filter)
    .limit(parseInt(limit))
    .sort({ lastName: 1 });
  
  res.status(200).json({
    status: 'success',
    data: users,
  });
});

/**
 * Recherche spécifique attestations (admin)
 */
exports.searchCertificates = catchAsync(async (req, res, next) => {
  const { q, source, userId, limit = 50 } = req.query;
  
  const filter = {};
  if (source) filter.source = source;
  if (userId) filter.userId = userId;
  if (q && q.length >= 2) {
    filter.certificateNumber = { $regex: q, $options: 'i' };
  }
  
  const certificates = await Certificate.find(filter)
    .populate('userId', 'firstName lastName email')
    .populate('formationId', 'title')
    .limit(parseInt(limit))
    .sort({ issueDate: -1 });
  
  res.status(200).json({
    status: 'success',
    data: certificates,
  });
});

/**
 * Recherche spécifique déclarations personnelles (admin)
 */
exports.searchPersonalTrainings = catchAsync(async (req, res, next) => {
  const { q, status, userId, limit = 50 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  if (q && q.length >= 2) {
    filter.$or = [
      { trainingName: { $regex: q, $options: 'i' } },
      { provider: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  
  const trainings = await PersonalTraining.find(filter)
    .populate('userId', 'firstName lastName email')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    data: trainings,
  });
});