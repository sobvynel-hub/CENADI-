/**
 * controllers/statsController.js – Statistiques et indicateurs clés
 */

const User = require('../models/User');
const Formation = require('../models/Formation');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const PersonalTraining = require('../models/PersonalTraining');
const catchAsync = require('../utils/catchAsync');
const { FORMATION_STATUS } = require('../utils/constants');

/**
 * Dashboard principal - indicateurs clés
 */
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const [
    totalUsers,
    activeUsers,
    totalFormations,
    upcomingFormations,
    completedFormations,
    totalEnrollments,
    confirmedEnrollments,
    totalCertificates,
    pendingPersonalTrainings,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Formation.countDocuments(),
    Formation.countDocuments({ status: FORMATION_STATUS.UPCOMING }),
    Formation.countDocuments({ status: FORMATION_STATUS.COMPLETED }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'confirmed' }),
    Certificate.countDocuments({ isIssued: true }),
    PersonalTraining.countDocuments({ status: 'pending' }),
  ]);
  
  // Inscriptions par mois (derniers 12 mois)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const monthlyEnrollments = await Enrollment.aggregate([
    { $match: { registrationDate: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$registrationDate' },
          month: { $month: '$registrationDate' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  
  // Formations les plus suivies
  const topFormations = await Enrollment.aggregate([
    { $group: { _id: '$formationId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'formations',
        localField: '_id',
        foreignField: '_id',
        as: 'formation',
      },
    },
    { $unwind: '$formation' },
    { $project: { title: '$formation.title', count: 1 } },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      users: { total: totalUsers, active: activeUsers },
      formations: { total: totalFormations, upcoming: upcomingFormations, completed: completedFormations },
      enrollments: { total: totalEnrollments, confirmed: confirmedEnrollments },
      certificates: totalCertificates,
      pendingPersonalTrainings,
      monthlyEnrollments,
      topFormations,
    },
  });
});

/**
 * Statistiques détaillées des formations
 */
exports.getFormationStats = catchAsync(async (req, res, next) => {
  const stats = await Formation.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgCapacity: { $avg: '$maxCapacity' },
        avgEnrolled: { $avg: '$currentEnrolled' },
      },
    },
  ]);
  
  const averageAttendance = await Enrollment.aggregate([
    { $match: { attended: true } },
    { $group: { _id: '$formationId', attendanceRate: { $avg: { $cond: ['$attended', 100, 0] } } } },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: { statusStats: stats, averageAttendance },
  });
});

/**
 * Statistiques des inscriptions
 */
exports.getEnrollmentStats = catchAsync(async (req, res, next) => {
  const totalEnrollments = await Enrollment.countDocuments();
  
  const statusDistribution = await Enrollment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  
  const attendanceStats = await Enrollment.aggregate([
    { $group: { _id: '$attended', count: { $sum: 1 } } },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      total: totalEnrollments,
      statusDistribution,
      attendanceStats: {
        present: attendanceStats.find(s => s._id === true)?.count || 0,
        absent: attendanceStats.find(s => s._id === false)?.count || 0,
      },
    },
  });
});

/**
 * Statistiques des attestations
 */
exports.getCertificateStats = catchAsync(async (req, res, next) => {
  const totalCertificates = await Certificate.countDocuments({ isIssued: true });
  
  const sourceDistribution = await Certificate.aggregate([
    { $match: { isIssued: true } },
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ]);
  
  const monthlyCertificates = await Certificate.aggregate([
    { $match: { isIssued: true } },
    {
      $group: {
        _id: {
          year: { $year: '$issueDate' },
          month: { $month: '$issueDate' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      total: totalCertificates,
      sourceDistribution,
      monthlyCertificates,
    },
  });
});

/**
 * Statistiques par division
 */
exports.getDivisionStats = catchAsync(async (req, res, next) => {
  const divisionStats = await User.aggregate([
    { $match: { division: { $exists: true, $ne: null } } },
    { $group: { _id: '$division', userCount: { $sum: 1 } } },
    { $sort: { userCount: -1 } },
  ]);
  
  const enrollmentsByDivision = await Enrollment.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    { $group: { _id: '$user.division', enrollmentCount: { $sum: 1 } } },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      divisions: divisionStats,
      enrollmentsByDivision,
    },
  });
});

/**
 * Statistiques des déclarations personnelles
 */
exports.getPersonalTrainingStats = catchAsync(async (req, res, next) => {
  const total = await PersonalTraining.countDocuments();
  
  const statusDistribution = await PersonalTraining.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  
  const monthlyDeclarations = await PersonalTraining.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      total,
      statusDistribution,
      monthlyDeclarations,
    },
  });
});