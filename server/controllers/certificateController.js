/**
 * controllers/certificateController.js – Gestion des attestations
 */

const fs = require('fs');
const path = require('path');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Formation = require('../models/Formation');
const User = require('../models/User');
const PersonalTraining = require('../models/PersonalTraining');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { generateCertificateNumber, parsePagination, paginatedResponse } = require('../utils/helpers');
const { CERTIFICATE_SOURCE, ENROLLMENT_STATUS } = require('../utils/constants');
const { generateCertificatePDF } = require('../services/pdfService');
const { sendCertificateEmail } = require('../services/emailService');

/**
 * Liste toutes les attestations
 */
exports.getAllCertificates = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { source, userId, formationId } = req.query;
  
  const filter = {};
  if (source) filter.source = source;
  if (userId) filter.userId = userId;
  if (formationId) filter.formationId = formationId;
  
  const [certificates, total] = await Promise.all([
    Certificate.find(filter)
      .populate('userId', 'firstName lastName email employeeId')
      .populate('formationId', 'title')
      .populate('personalTrainingId', 'trainingName')
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limit),
    Certificate.countDocuments(filter),
  ]);
  
  res.status(200).json(paginatedResponse(certificates, total, page, limit));
});

/**
 * Récupère les attestations d'un utilisateur
 */
exports.getCertificatesByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const certificates = await Certificate.find({ userId })
    .populate('formationId', 'title startDate endDate')
    .populate('personalTrainingId', 'trainingName provider')
    .sort({ issueDate: -1 });
  
  res.status(200).json({
    status: 'success',
    data: certificates,
  });
});

/**
 * Génère une attestation pour une inscription (formation entreprise)
 */
exports.generateCertificate = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;
  
  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('userId')
    .populate('formationId');
  
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }
  
  if (!enrollment.attended) {
    return next(new AppError('L\'employé n\'a pas participé à cette formation', 400));
  }
  
  // Vérifier si une attestation existe déjà
  let certificate = await Certificate.findOne({
    userId: enrollment.userId,
    formationId: enrollment.formationId,
    source: CERTIFICATE_SOURCE.ENTERPRISE,
  });
  
  if (certificate && certificate.isIssued) {
    return next(new AppError('Une attestation a déjà été générée pour cette formation', 400));
  }
  
  // Générer le numéro d'attestation
  const certificateNumber = generateCertificateNumber();
  
  // Générer le PDF
  const pdfPath = await generateCertificatePDF({
    userName: `${enrollment.userId.firstName} ${enrollment.userId.lastName}`,
    formationName: enrollment.formationId.title,
    startDate: enrollment.formationId.startDate,
    endDate: enrollment.formationId.endDate,
    duration: enrollment.formationId.durationDays,
    certificateNumber,
  });
  
  // Sauvegarder en base
  if (!certificate) {
    certificate = await Certificate.create({
      userId: enrollment.userId._id,
      formationId: enrollment.formationId._id,
      source: CERTIFICATE_SOURCE.ENTERPRISE,
      certificateNumber,
      issueDate: new Date(),
      fileUrl: pdfPath,
      isIssued: true,
      issuedBy: req.user._id,
    });
  } else {
    certificate.certificateNumber = certificateNumber;
    certificate.issueDate = new Date();
    certificate.fileUrl = pdfPath;
    certificate.isIssued = true;
    certificate.issuedBy = req.user._id;
    await certificate.save();
  }
  
  // Mettre à jour l'inscription
  enrollment.certificateIssued = true;
  enrollment.certificateUrl = pdfPath;
  enrollment.certificateIssuedDate = new Date();
  await enrollment.save();
  
  await Log.create({
    userId: req.user._id,
    action: 'CERTIFICATE_GENERATE',
    entity: 'Certificate',
    entityId: certificate._id,
    details: { enrollmentId, certificateNumber },
    ip: req.ip,
  });
  
  res.status(201).json({
    status: 'success',
    data: certificate,
  });
});

/**
 * Génère une attestation pour une formation personnelle
 */
exports.generatePersonalCertificate = catchAsync(async (req, res, next) => {
  const { personalTrainingId } = req.params;
  
  const personalTraining = await PersonalTraining.findById(personalTrainingId)
    .populate('userId');
  
  if (!personalTraining) {
    return next(new AppError('Déclaration personnelle non trouvée', 404));
  }
  
  if (personalTraining.status !== 'approved') {
    return next(new AppError('Cette déclaration n\'a pas été validée', 400));
  }
  
  // Vérifier si une attestation existe déjà
  let certificate = await Certificate.findOne({
    userId: personalTraining.userId,
    personalTrainingId,
    source: CERTIFICATE_SOURCE.PERSONAL,
  });
  
  if (certificate && certificate.isIssued) {
    return next(new AppError('Une attestation a déjà été générée', 400));
  }
  
  const certificateNumber = generateCertificateNumber();
  
  const pdfPath = await generateCertificatePDF({
    userName: `${personalTraining.userId.firstName} ${personalTraining.userId.lastName}`,
    formationName: personalTraining.trainingName,
    startDate: personalTraining.startDate,
    endDate: personalTraining.endDate,
    duration: personalTraining.duration,
    certificateNumber,
    isPersonal: true,
    provider: personalTraining.provider,
  });
  
  if (!certificate) {
    certificate = await Certificate.create({
      userId: personalTraining.userId._id,
      personalTrainingId,
      source: CERTIFICATE_SOURCE.PERSONAL,
      certificateNumber,
      issueDate: new Date(),
      fileUrl: pdfPath,
      isIssued: true,
      issuedBy: req.user._id,
    });
  } else {
    certificate.certificateNumber = certificateNumber;
    certificate.issueDate = new Date();
    certificate.fileUrl = pdfPath;
    certificate.isIssued = true;
    certificate.issuedBy = req.user._id;
    await certificate.save();
  }
  
  personalTraining.certificateIssued = true;
  personalTraining.certificateUrl = pdfPath;
  await personalTraining.save();
  
  res.status(201).json({
    status: 'success',
    data: certificate,
  });
});

/**
 * Envoie l'attestation par email
 */
exports.sendCertificateEmail = catchAsync(async (req, res, next) => {
  const { certificateId } = req.params;
  
  const certificate = await Certificate.findById(certificateId)
    .populate('userId')
    .populate('formationId', 'title');
  
  if (!certificate) {
    return next(new AppError('Attestation non trouvée', 404));
  }
  
  if (certificate.emailSent) {
    return next(new AppError('L\'email a déjà été envoyé', 400));
  }
  
  const formationName = certificate.formationId?.title || 
    (await PersonalTraining.findById(certificate.personalTrainingId))?.trainingName ||
    'Formation';
  
  await sendCertificateEmail(
    certificate.userId.email,
    `${certificate.userId.firstName} ${certificate.userId.lastName}`,
    formationName,
    `${process.env.BACKEND_URL}/uploads/certificates/${path.basename(certificate.fileUrl)}`
  );
  
  certificate.emailSent = true;
  certificate.emailSentAt = new Date();
  await certificate.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Email envoyé avec succès',
  });
});

/**
 * Télécharge l'attestation (fichier PDF)
 */
exports.downloadCertificate = catchAsync(async (req, res, next) => {
  const { certificateId } = req.params;
  
  const certificate = await Certificate.findById(certificateId);
  if (!certificate || !certificate.fileUrl) {
    return next(new AppError('Attestation non trouvée', 404));
  }
  
  const filePath = path.resolve(certificate.fileUrl);
  if (!fs.existsSync(filePath)) {
    return next(new AppError('Fichier non trouvé sur le serveur', 404));
  }
  
  res.download(filePath, `attestation_${certificate.certificateNumber}.pdf`);
});