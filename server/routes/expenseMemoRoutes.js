const express = require('express');
const router = express.Router();
const expenseMemoController = require('../controllers/expenseMemoController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.get('/sections', expenseMemoController.getSections);
router.get('/formation/:formationId', expenseMemoController.getExpenseMemoByFormation);
router.put('/formation/:formationId/lines/:lineId', expenseMemoController.updateLine);
router.post('/formation/:formationId/reset', expenseMemoController.resetToDefault);
router.post('/formation/:formationId/submit', expenseMemoController.submitMemo);
router.patch('/formation/:formationId/validate', expenseMemoController.validateMemo);
router.post('/formation/:formationId/import/excel', upload.single('file'), expenseMemoController.importFromExcel);
router.get('/formation/:formationId/export/excel', expenseMemoController.exportToExcel);
router.get('/formation/:formationId/export/pdf', expenseMemoController.exportToPDF);

module.exports = router;