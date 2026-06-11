/**
 * services/searchService.js – Service de recherche avancée
 */

const Formation = require('../models/Formation');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const PersonalTraining = require('../models/PersonalTraining');

/**
 * Recherche textuelle sur les formations
 */
const searchFormations = async (query, filters = {}) => {
  const searchFilter = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { trainer: { $regex: query, $options: 'i' } },
      { location: { $regex: query, $options: 'i' } },
    ],
  };
  
  if (filters.status) searchFilter.status = filters.status;
  if (filters.isPublic !== undefined) searchFilter.isPublic = filters.isPublic;
  
  return Formation.find(searchFilter).sort({ startDate: -1 }).limit(50);
};

/**
 * Recherche textuelle sur les utilisateurs
 */
const searchUsers = async (query, filters = {}) => {
  const searchFilter = {
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { employeeId: { $regex: query, $options: 'i' } },
      { division: { $regex: query, $options: 'i' } },
      { position: { $regex: query, $options: 'i' } },
    ],
  };
  
  if (filters.division) searchFilter.division = filters.division;
  if (filters.role) searchFilter.role = filters.role;
  if (filters.isActive !== undefined) searchFilter.isActive = filters.isActive;
  
  return User.find(searchFilter).select('-password').limit(50);
};

/**
 * Recherche textuelle sur les attestations
 */
const searchCertificates = async (query, filters = {}) => {
  const searchFilter = {};
  
  if (query) {
    searchFilter.certificateNumber = { $regex: query, $options: 'i' };
  }
  
  if (filters.source) searchFilter.source = filters.source;
  if (filters.userId) searchFilter.userId = filters.userId;
  
  return Certificate.find(searchFilter)
    .populate('userId', 'firstName lastName email')
    .populate('formationId', 'title')
    .limit(50);
};

/**
 * Recherche textuelle sur les déclarations personnelles
 */
const searchPersonalTrainings = async (query, filters = {}) => {
  const searchFilter = {};
  
  if (query) {
    searchFilter.$or = [
      { trainingName: { $regex: query, $options: 'i' } },
      { provider: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }
  
  if (filters.status) searchFilter.status = filters.status;
  if (filters.userId) searchFilter.userId = filters.userId;
  
  return PersonalTraining.find(searchFilter)
    .populate('userId', 'firstName lastName email')
    .limit(50);
};

module.exports = {
  searchFormations,
  searchUsers,
  searchCertificates,
  searchPersonalTrainings,
};