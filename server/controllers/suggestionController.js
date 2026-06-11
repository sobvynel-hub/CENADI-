/**
 * controllers/suggestionController.js – Gestion des suggestions
 */

const Suggestion = require('../models/Suggestion');
const BlogPost = require('../models/BlogPost');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { parsePagination, paginatedResponse } = require('../utils/helpers');

/**
 * Liste des suggestions (admin)
 */
exports.getAllSuggestions = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, priority, category, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [suggestions, total] = await Promise.all([
    Suggestion.find(filter)
      .populate('suggestedBy', 'firstName lastName email division')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Suggestion.countDocuments(filter),
  ]);

  res.status(200).json(paginatedResponse(suggestions, total, page, limit));
});

/**
 * Crée une suggestion (employé)
 */
exports.createSuggestion = catchAsync(async (req, res, next) => {
  const { title, description, reason, expectedBenefits, targetAudience, category, priority, tags, source } = req.body;
  
  const suggestion = await Suggestion.create({
    title,
    description,
    reason,
    expectedBenefits,
    targetAudience,
    category: category || 'technical',
    priority: priority || 'medium',
    tags: tags || [],
    source: source || 'employee',
    suggestedBy: req.user._id,
    suggestedByName: `${req.user.firstName} ${req.user.lastName}`,
    suggestedByDivision: req.user.division,
  });
  
  res.status(201).json({
    status: 'success',
    data: suggestion,
  });
});

/**
 * Vote pour une suggestion
 */
exports.voteSuggestion = catchAsync(async (req, res, next) => {
  const suggestion = await Suggestion.findById(req.params.id);
  
  if (!suggestion) {
    return next(new AppError('Suggestion non trouvée', 404));
  }
  
  const hasVoted = suggestion.voters.includes(req.user._id);
  
  if (hasVoted) {
    await Suggestion.findByIdAndUpdate(req.params.id, {
      $inc: { votes: -1 },
      $pull: { voters: req.user._id }
    });
  } else {
    await Suggestion.findByIdAndUpdate(req.params.id, {
      $inc: { votes: 1 },
      $push: { voters: req.user._id }
    });
  }
  
  const updatedSuggestion = await Suggestion.findById(req.params.id);
  
  res.status(200).json({
    status: 'success',
    data: { votes: updatedSuggestion.votes, hasVoted: !hasVoted },
  });
});

/**
 * Approuve/rejette une suggestion (admin)
 */
exports.updateSuggestionStatus = catchAsync(async (req, res, next) => {
  const { status, adminComment } = req.body;
  
  const suggestion = await Suggestion.findByIdAndUpdate(
    req.params.id,
    { 
      status,
      adminComment,
      reviewedBy: req.user._id,
    },
    { new: true }
  );
  
  if (!suggestion) {
    return next(new AppError('Suggestion non trouvée', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: suggestion,
  });
});

/**
 * Supprime une suggestion
 */
exports.deleteSuggestion = catchAsync(async (req, res, next) => {
  const suggestion = await Suggestion.findByIdAndDelete(req.params.id);
  
  if (!suggestion) {
    return next(new AppError('Suggestion non trouvée', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Statistiques des suggestions
 */
exports.getStats = catchAsync(async (req, res, next) => {
  const total = await Suggestion.countDocuments();
  const pending = await Suggestion.countDocuments({ status: 'pending' });
  const approved = await Suggestion.countDocuments({ status: 'approved' });
  const implemented = await Suggestion.countDocuments({ status: 'implemented' });
  const highPriority = await Suggestion.countDocuments({ priority: 'high' });
  const totalVotes = await Suggestion.aggregate([{ $group: { _id: null, total: { $sum: '$votes' } } }]);
  
  res.status(200).json({
    status: 'success',
    data: {
      total,
      pending,
      approved,
      implemented,
      highPriority,
      totalVotes: totalVotes[0]?.total || 0,
    },
  });
});