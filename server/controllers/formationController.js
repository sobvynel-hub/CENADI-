/**
 * controllers/formationController.js – Gestion des formations
 */

const Formation  = require('../models/Formation');
const Enrollment = require('../models/Enrollment');
const Log        = require('../models/Log');
const AppError   = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  parsePagination,
  paginatedResponse,
  filterObject,
  generateSlug,
} = require('../utils/helpers');
const { FORMATION_STATUS } = require('../utils/constants');

// ─────────────────────────────────────────────────────────────────────────────
// Routes PUBLIQUES (visiteurs non authentifiés)
// ─────────────────────────────────────────────────────────────────────────────

/** Toutes les formations publiées (page d'accueil) */
exports.getUpcomingFormations = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { division }          = req.query;

  const filter = { isPublic: true };
  if (division) filter.targetDivisions = division;

  const [formations, total] = await Promise.all([
    Formation.find(filter).sort({ startDate: -1 }).skip(skip).limit(limit),
    Formation.countDocuments(filter),
  ]);

  res.status(200).json(paginatedResponse(formations, total, page, limit));
});

/** Formations terminées et publiées */
exports.getPastFormations = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);

  const filter = {
    status:   FORMATION_STATUS.COMPLETED,
    isPublic: true,
    endDate:  { $lt: new Date() },
  };

  const [formations, total] = await Promise.all([
    Formation.find(filter).sort({ endDate: -1 }).skip(skip).limit(limit),
    Formation.countDocuments(filter),
  ]);

  res.status(200).json(paginatedResponse(formations, total, page, limit));
});

/**
 * GET /:id — Route PUBLIQUE
 * Retourne la formation si elle est publiée.
 * Retourne 404 si non publiée (sauf si l'utilisateur est connecté via
 * un autre mécanisme — cas rare, pas utilisé côté admin).
 *
 * ⚠️  Les pages admin NE DOIVENT PAS utiliser cette route.
 *     Elles doivent utiliser getFormationByIdAdmin (GET /:id/admin).
 */
exports.getFormationById = catchAsync(async (req, res, next) => {
  const formation = await Formation.findById(req.params.id);

  if (!formation) return next(new AppError('Formation non trouvée', 404));

  // Bloque l'accès aux formations non publiées pour les visiteurs
  if (!formation.isPublic) {
    return next(new AppError('Formation non trouvée', 404));
  }

  res.status(200).json({ status: 'success', data: formation });
});

/** Détail par slug (public) */
exports.getFormationBySlug = catchAsync(async (req, res, next) => {
  const formation = await Formation.findOne({ slug: req.params.slug });

  if (!formation) return next(new AppError('Formation non trouvée', 404));

  res.status(200).json({ status: 'success', data: formation });
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes ADMIN (protect + restrictTo requis — appliqués dans formationRoutes)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /:id/admin — Route ADMIN uniquement
 *
 * ✅ NOUVEAU HANDLER — Résout le bug 404 sur FormationReport et
 *    FormationDetail quand la formation est dépubliée.
 *
 * Retourne la formation quelle que soit sa valeur isPublic.
 * Utilisé par : FormationDetail.jsx, FormationReport.jsx, ExpenseMemoPage.jsx
 * Via : formationsApi.getByIdAdmin(id)
 */
exports.getFormationByIdAdmin = catchAsync(async (req, res, next) => {
  const formation = await Formation.findById(req.params.id);

  if (!formation) return next(new AppError('Formation non trouvée', 404));

  res.status(200).json({ status: 'success', data: formation });
});

/** Liste complète (admin) */
exports.getAllFormations = catchAsync(async (req, res, next) => {
  const { page, limit, skip }                  = parsePagination(req.query);
  const { status, search, division, isPublic } = req.query;

  const filter = {};
  const isAdmin = ['admin', 'super_admin'].includes(req.user?.role);

  if (!isAdmin) {
    filter.isPublic = true;
  }

  if (status)               filter.status           = status;
  if (isAdmin && isPublic !== undefined) filter.isPublic = isPublic === 'true';
  if (division)             filter.targetDivisions  = division;
  if (search) {
    filter.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { trainer:     { $regex: search, $options: 'i' } },
    ];
  }

  const [formations, total] = await Promise.all([
    Formation.find(filter).sort({ startDate: -1 }).skip(skip).limit(limit),
    Formation.countDocuments(filter),
  ]);

  res.status(200).json(paginatedResponse(formations, total, page, limit));
});

exports.getAllFormationsAdmin = exports.getAllFormations;

/** Créer une formation */
exports.createFormation = catchAsync(async (req, res, next) => {
  const {
    title, description, objectives, program, prerequisites, skillsToAcquire,
    trainer, trainerBio, startDate, endDate, location, maxCapacity,
    targetDivisions, isPublic, cost, level,
  } = req.body;

  const slug = `${generateSlug(title)}-${Date.now()}`;

  const formation = await Formation.create({
    title, slug, description, objectives, program,
    prerequisites:   prerequisites   || [],
    skillsToAcquire: skillsToAcquire || [],
    trainer, trainerBio, startDate, endDate, location, maxCapacity,
    targetDivisions: targetDivisions || [],
    isPublic:   isPublic !== undefined ? isPublic : true,
    coverImage: req.file ? req.file.path : null,
    createdBy:  req.user._id,
    status:     new Date(startDate) > new Date()
      ? FORMATION_STATUS.UPCOMING
      : FORMATION_STATUS.ONGOING,
    cost:  cost  || 0,
    level: level || 'Débutant',
  });

  await Log.create({
    userId: req.user._id, action: 'FORMATION_CREATE',
    entity: 'Formation',  entityId: formation._id,
    details: { title, startDate, endDate, cost, level }, ip: req.ip,
  });

  res.status(201).json({ status: 'success', data: formation });
});

/** Mettre à jour une formation */
exports.updateFormation = catchAsync(async (req, res, next) => {
  const allowedFields = [
    'title', 'description', 'objectives', 'program', 'prerequisites',
    'skillsToAcquire', 'trainer', 'trainerBio', 'startDate', 'endDate',
    'location', 'maxCapacity', 'targetDivisions', 'isPublic', 'cost', 'level', 'status',
  ];

  const filteredBody = filterObject(req.body, ...allowedFields);

  if (filteredBody.title) {
    filteredBody.slug = `${generateSlug(filteredBody.title)}-${Date.now()}`;
  }
  if (req.file) {
    filteredBody.coverImage = req.file.path;
  }

  const formation = await Formation.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true, runValidators: true,
  });

  if (!formation) return next(new AppError('Formation non trouvée', 404));

  await Log.create({
    userId: req.user._id, action: 'FORMATION_UPDATE',
    entity: 'Formation',  entityId: formation._id,
    details: filteredBody, ip: req.ip,
  });

  res.status(200).json({ status: 'success', data: formation });
});

/** Supprimer une formation */
exports.deleteFormation = catchAsync(async (req, res, next) => {
  const enrollmentsCount = await Enrollment.countDocuments({
    formationId: req.params.id,
  });

  if (enrollmentsCount > 0) {
    return next(
      new AppError(`Impossible de supprimer : ${enrollmentsCount} inscription(s) existent`, 400)
    );
  }

  const formation = await Formation.findByIdAndDelete(req.params.id);
  if (!formation) return next(new AppError('Formation non trouvée', 404));

  await Log.create({
    userId: req.user._id, action: 'FORMATION_DELETE',
    entity: 'Formation',  entityId: formation._id,
    details: { title: formation.title }, ip: req.ip,
  });

  res.status(204).json({ status: 'success', data: null });
});

/**
 * Changer le statut d'une formation
 * ✅ Log corrigé : on sauvegarde previousStatus AVANT la mise à jour
 */
exports.updateFormationStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!Object.values(FORMATION_STATUS).includes(status)) {
    return next(new AppError('Statut invalide', 400));
  }

  const existing = await Formation.findById(req.params.id).select('status');
  if (!existing) return next(new AppError('Formation non trouvée', 404));

  const previousStatus = existing.status;

  const formation = await Formation.findByIdAndUpdate(
    req.params.id, { status }, { new: true }
  );

  await Log.create({
    userId: req.user._id, action: 'FORMATION_STATUS_CHANGE',
    entity: 'Formation',  entityId: formation._id,
    details: { previousStatus, newStatus: status }, ip: req.ip,
  });

  res.status(200).json({ status: 'success', data: formation });
});

/**
 * Publier / Dépublier une formation
 * ✅ Validation stricte : isPublic doit être un booléen natif
 */
exports.togglePublish = catchAsync(async (req, res, next) => {
  const { isPublic } = req.body;

  if (typeof isPublic !== 'boolean') {
    return next(
      new AppError('Le champ isPublic doit être un booléen (true ou false)', 400)
    );
  }

  const formation = await Formation.findByIdAndUpdate(
    req.params.id, { isPublic }, { new: true }
  );

  if (!formation) return next(new AppError('Formation non trouvée', 404));

  await Log.create({
    userId: req.user._id,
    action: isPublic ? 'FORMATION_PUBLISH' : 'FORMATION_UNPUBLISH',
    entity: 'Formation', entityId: formation._id,
    details: { isPublic }, ip: req.ip,
  });

  res.status(200).json({ status: 'success', data: formation });
});

/** Dupliquer une formation */
exports.duplicateFormation = catchAsync(async (req, res, next) => {
  const original = await Formation.findById(req.params.id);
  if (!original) return next(new AppError('Formation non trouvée', 404));

  const duplicated = await Formation.create({
    ...original.toObject(),
    _id:             undefined,
    title:           `${original.title} (Copie)`,
    slug:            `${generateSlug(original.title)}-${Date.now()}`,
    status:          FORMATION_STATUS.UPCOMING,
    currentEnrolled: 0,
    createdBy:       req.user._id,
  });

  await Log.create({
    userId: req.user._id, action: 'FORMATION_DUPLICATE',
    entity: 'Formation',  entityId: duplicated._id,
    details: { originalId: req.params.id, title: original.title }, ip: req.ip,
  });

  res.status(201).json({ status: 'success', data: duplicated });
});
