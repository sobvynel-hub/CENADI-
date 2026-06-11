/**
 * routes/formationRoutes.js – Gestion des formations
 * Base URL: /api/formations
 *
 * ─── Architecture des routes ────────────────────────────────────────────────
 *
 * PROBLÈME RACINE (maintenant corrigé) :
 *   La route publique GET /:id était déclarée AVANT router.use(protect).
 *   Résultat : tous les appels à GET /formations/:id — y compris ceux
 *   venant de pages admin authentifiées — passaient par getFormationById,
 *   le handler public qui bloque les formations non publiées quand
 *   req.user est absent.
 *
 *   Dans ce cas req.user était absent parce que protect n'avait pas encore
 *   tourné — la route publique est matchée en premier, le middleware protect
 *   n'est donc jamais appelé.
 *
 * SOLUTION :
 *   • On garde GET /:id public pour les visiteurs (formations publiées).
 *   • On ajoute GET /:id/admin (protégée) pour les pages admin :
 *     cette route retourne la formation sans restriction de publication.
 *   • FormationDetail.jsx et FormationReport.jsx utilisent getByIdAdmin.
 *
 * RÈGLE Express rappel :
 *   Les routes avec segments fixes doivent toujours être déclarées
 *   AVANT les routes avec paramètres dynamiques (:id).
 */

const express = require('express');
const router  = express.Router();

const formationController  = require('../controllers/formationController');
const { protect }          = require('../middleware/auth');
const { restrictTo }       = require('../middleware/role');
const { uploadCoverImage } = require('../middleware/upload');
const { validateFormation } = require('../middleware/validation');

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 1 — Routes publiques (sans authentification)
// Segments fixes EN PREMIER, paramètres dynamiques EN DERNIER
// ─────────────────────────────────────────────────────────────────────────────
router.get('/upcoming',     formationController.getUpcomingFormations);
router.get('/past',         formationController.getPastFormations);
router.get('/slug/:slug',   formationController.getFormationBySlug);

// Route publique /:id — formations publiées uniquement (visiteurs)
router.get('/:id',          formationController.getFormationById);

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 2 — Authentification obligatoire pour tout ce qui suit
// ─────────────────────────────────────────────────────────────────────────────
router.use(protect);

router.get('/', formationController.getAllFormations);

router.use(restrictTo('admin', 'super_admin'));

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 3 — Routes admin avec segments fixes (AVANT les routes /:id)
//
// ✅ FIX PRINCIPAL : GET /:id/admin
//    Route dédiée pour les pages admin (FormationDetail, FormationReport,
//    ExpenseMemoPage…). Retourne la formation quelle que soit sa valeur
//    isPublic. Les pages admin doivent utiliser formationsApi.getByIdAdmin().
// ─────────────────────────────────────────────────────────────────────────────
router.get(   '/:id/admin',     formationController.getFormationByIdAdmin);
router.patch( '/:id/publish',   formationController.togglePublish);
router.patch( '/:id/status',    formationController.updateFormationStatus);
router.post(  '/:id/duplicate', formationController.duplicateFormation);

// ─────────────────────────────────────────────────────────────────────────────
// BLOC 4 — Routes admin génériques (liste + CRUD) — EN DERNIER
// ─────────────────────────────────────────────────────────────────────────────
router
  .route('/')
  .post(uploadCoverImage, validateFormation, formationController.createFormation);

router
  .route('/:id')
  .patch( uploadCoverImage, validateFormation, formationController.updateFormation)
  .put(   uploadCoverImage, validateFormation, formationController.updateFormation)
  .delete(formationController.deleteFormation);

module.exports = router;
