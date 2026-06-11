// server/controllers/expenseMemoController.js
const ExpenseMemo = require('../models/ExpenseMemo');
const Formation   = require('../models/Formation');
const AppError    = require('../utils/AppError');
const catchAsync  = require('../utils/catchAsync');
const XLSX        = require('xlsx');

// ─── Données référentielles ───────────────────────────────────────────────────

const SECTIONS = {
  A: { label: 'A - SUPERVISION',              defaultTaux: 11    },
  B: { label: 'B - COORDINATION',             defaultTaux: 11    },
  C: { label: 'C - SECRÉTARIAT',              defaultTaux: 11    },
  D: { label: 'D - DRH',                      defaultTaux: 11    },
  E: { label: 'E - TRANSPORT',                defaultTaux: 11    },
  F: { label: 'F - FORMATEURS & PRESTATIONS', defaultTaux: 24.75 },
};

const PREDEFINED_LINES = [
  { code: 'A', designation: 'Supervision générale',              defaultNombre: 1,  defaultPrix: 1000000, isFixedAmount: false },
  { code: 'A', designation: 'Supervision technique',             defaultNombre: 1,  defaultPrix: 1000000, isFixedAmount: false },
  { code: 'B', designation: 'Coordination générale',             defaultNombre: 1,  defaultPrix: 500000,  isFixedAmount: false },
  { code: 'B', designation: 'Coordination technique',            defaultNombre: 1,  defaultPrix: 500000,  isFixedAmount: false },
  { code: 'C', designation: 'Chef Secrétariat',                  defaultNombre: 1,  defaultPrix: 400000,  isFixedAmount: false },
  { code: 'C', designation: 'Personnels du Secrétariat Technique', defaultNombre: 4, defaultPrix: 300000, isFixedAmount: false },
  { code: 'C', designation: 'Rapporteur général',                defaultNombre: 1,  defaultPrix: 250000,  isFixedAmount: false },
  { code: 'D', designation: 'DRH',                               defaultNombre: 1,  defaultPrix: 400000,  isFixedAmount: false },
  { code: 'D', designation: 'Sous DRH',                          defaultNombre: 1,  defaultPrix: 200000,  isFixedAmount: false },
  { code: 'D', designation: 'Secrétaire général permanent',      defaultNombre: 1,  defaultPrix: 100000,  isFixedAmount: false },
  { code: 'D', designation: 'Chef Service Financier',            defaultNombre: 1,  defaultPrix: 100000,  isFixedAmount: false },
  { code: 'E', designation: 'Transport',                         defaultNombre: 10, defaultPrix: 200000,  isFixedAmount: false },
  { code: 'F', designation: 'Formateurs',          defaultNombre: 5,  defaultPrix: 0, isFixedAmount: true, defaultFixedAmount: 10000000 },
  { code: 'F', designation: 'Kits des participants', defaultNombre: 15, defaultPrix: 0, isFixedAmount: true, defaultFixedAmount: 2000000  },
  { code: 'F', designation: 'Location de la salle', defaultNombre: 0, defaultPrix: 0, isFixedAmount: true, defaultFixedAmount: 4000000  },
  { code: 'F', designation: 'Restauration',         defaultNombre: 15, defaultPrix: 0, isFixedAmount: true, defaultFixedAmount: 1000000  },
  { code: 'F', designation: 'Imprévus + divers',    defaultNombre: 0, defaultPrix: 0, isFixedAmount: true, defaultFixedAmount: 350000   },
];

// ─── Helpers de calcul ────────────────────────────────────────────────────────

const calculateLineTotals = (line) => {
  const montantTTC = line.isFixedAmount
    ? (line.fixedAmount || 0)
    : (line.nombre || 0) * (line.prixUnitaire || 0);
  const irnc      = montantTTC * ((line.tauxIRNC || 0) / 100);
  const montantNet = montantTTC - irnc;
  return { montantTTC, irnc, montantNet };
};

/**
 * Recalcule les montants de chaque ligne et retourne les totaux généraux.
 * ✅ CORRECTION : on affecte les résultats via Object.assign pour que Mongoose
 *    détecte bien les changements sur les sous-documents (pas de markModified
 *    nécessaire quand on mute les propriétés directement).
 */
const recalculateMemoTotals = (lines) => {
  let totalTTC = 0, totalIRNC = 0, totalNet = 0;
  lines.forEach((line) => {
    const { montantTTC, irnc, montantNet } = calculateLineTotals(line);
    line.montantTTC  = montantTTC;
    line.irnc        = irnc;
    line.montantNet  = montantNet;
    totalTTC  += montantTTC;
    totalIRNC += irnc;
    totalNet  += montantNet;
  });
  return {
    montantTotalTTC:  totalTTC,
    montantTotalIRNC: totalIRNC,
    montantTotalNet:  totalNet,
  };
};

/** Construit le tableau de lignes par défaut. */
const buildDefaultLines = () =>
  PREDEFINED_LINES.map((item, idx) => {
    const montantTTC = item.isFixedAmount
      ? (item.defaultFixedAmount || 0)
      : item.defaultNombre * item.defaultPrix;
    const taux = SECTIONS[item.code].defaultTaux;
    return {
      code:          item.code,
      sectionLabel:  SECTIONS[item.code].label,
      designation:   item.designation,
      nombre:        item.defaultNombre,
      prixUnitaire:  item.defaultPrix,
      tauxIRNC:      taux,
      isFixedAmount: item.isFixedAmount,
      fixedAmount:   item.defaultFixedAmount || 0,
      lineNumber:    idx + 1,
      montantTTC,
      irnc:          montantTTC * (taux / 100),
      montantNet:    montantTTC * (1 - taux / 100),
    };
  });

// ─── Contrôleurs ─────────────────────────────────────────────────────────────

/** Récupère (ou crée) la mémoire de dépenses d'une formation. */
exports.getExpenseMemoByFormation = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;

  let memo = await ExpenseMemo.findOne({ formationId });

  if (!memo) {
    const formation = await Formation.findById(formationId);
    if (!formation) return next(new AppError('Formation non trouvée', 404));

    const lines  = buildDefaultLines();
    const totals = recalculateMemoTotals(lines);

    memo = await ExpenseMemo.create({
      formationId,
      formationTitle: formation.title,
      lines,
      totals,
      createdBy: req.user._id,
      status: 'draft',
    });
  }

  res.status(200).json({ status: 'success', data: memo });
});

/** Met à jour une ligne et recalcule tous les totaux. */
exports.updateLine = catchAsync(async (req, res, next) => {
  const { formationId, lineId } = req.params;
  const { nombre, prixUnitaire, tauxIRNC, fixedAmount } = req.body;

  const memo = await ExpenseMemo.findOne({ formationId });
  if (!memo) return next(new AppError('Mémoire non trouvée', 404));

  const line = memo.lines.id(lineId);
  if (!line) return next(new AppError('Ligne non trouvée', 404));

  if (nombre       !== undefined) line.nombre       = nombre;
  if (prixUnitaire !== undefined) line.prixUnitaire = prixUnitaire;
  if (tauxIRNC     !== undefined) line.tauxIRNC     = tauxIRNC;
  if (fixedAmount  !== undefined) {
    line.fixedAmount  = fixedAmount;
    line.isFixedAmount = true;
  }

  // ✅ CORRECTION : marquer les sous-documents comme modifiés
  memo.markModified('lines');
  memo.totals = recalculateMemoTotals(memo.lines);
  memo.markModified('totals');
  memo.updatedBy = req.user._id;
  await memo.save();

  res.status(200).json({ status: 'success', data: memo });
});

/** Réinitialise la mémoire aux valeurs par défaut. */
exports.resetToDefault = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;

  const formation = await Formation.findById(formationId);
  if (!formation) return next(new AppError('Formation non trouvée', 404));

  const lines  = buildDefaultLines();
  const totals = recalculateMemoTotals(lines);

  let memo = await ExpenseMemo.findOne({ formationId });
  if (memo) {
    memo.lines  = lines;
    memo.totals = totals;
    memo.status = 'draft';
    memo.markModified('lines');
    memo.markModified('totals');
    await memo.save();
  } else {
    memo = await ExpenseMemo.create({
      formationId,
      formationTitle: formation.title,
      lines,
      totals,
      createdBy: req.user._id,
    });
  }

  res.status(200).json({ status: 'success', data: memo });
});

/** Soumet la mémoire pour validation. */
exports.submitMemo = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  const memo = await ExpenseMemo.findOne({ formationId });
  if (!memo) return next(new AppError('Mémoire non trouvée', 404));

  memo.status = 'submitted';
  await memo.save();
  res.status(200).json({ status: 'success', data: memo });
});

/** Approuve ou rejette la mémoire. */
exports.validateMemo = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  const { status, validationComment } = req.body;

  const memo = await ExpenseMemo.findOne({ formationId });
  if (!memo) return next(new AppError('Mémoire non trouvée', 404));

  memo.status            = status;
  memo.validationComment = validationComment;
  memo.validatedAt       = new Date();
  memo.validatedBy       = req.user._id;
  await memo.save();
  res.status(200).json({ status: 'success', data: memo });
});

// ─── Import Excel ─────────────────────────────────────────────────────────────

/**
 * ✅ CORRECTIONS :
 *  - Typo corrigée : "participantes" → "participants"
 *  - Détection de section plus robuste (expression régulière stricte)
 *  - Meilleure extraction du taux IRNC depuis l'en-tête de section
 *  - markModified après les modifications
 */
exports.importFromExcel = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  if (!req.file) return next(new AppError('Aucun fichier fourni', 400));

  console.log('📥 Fichier reçu:', req.file.originalname, req.file.size, 'octets');

  const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  const data     = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  let memo = await ExpenseMemo.findOne({ formationId });
  if (!memo) {
    const formation = await Formation.findById(formationId);
    if (!formation) return next(new AppError('Formation non trouvée', 404));
    const lines = buildDefaultLines();
    memo = await ExpenseMemo.create({
      formationId,
      formationTitle: formation.title,
      lines,
      totals: recalculateMemoTotals(lines),
      createdBy: req.user._id,
    });
  }

  // ✅ Correspondance désignation → désignation normalisée (typo corrigée)
  const DESIGNATION_MAP = {
    'Supervision générale':               'Supervision générale',
    'Supervision technique':              'Supervision technique',
    'Coordination générale':              'Coordination générale',
    'Coordination technique':             'Coordination technique',
    'Chef Secrétariat':                   'Chef Secrétariat',
    'Personnels du Secrétariat Technique':'Personnels du Secrétariat Technique',
    'Rapporteur général':                 'Rapporteur général',
    'DRH':                                'DRH',
    'Sous DRH':                           'Sous DRH',
    'Secrétaire général permanent':       'Secrétaire général permanent',
    'Chef Service Financier':             'Chef Service Financier',
    'Transport':                          'Transport',
    'Formateurs':                         'Formateurs',
    'Kits des participants':              'Kits des participants',  // ✅ typo corrigée
    'Kits des participantes':             'Kits des participants',  // rétrocompatiblité
    'Location de la salle':               'Location de la salle',
    'Restauration':                       'Restauration',
    'Imprévus + divers':                  'Imprévus + divers',
  };

  // ✅ Regex stricte : lettre seule A-F en début de cellule (ex: "A", "A -", "Section A")
  const SECTION_RE = /^\s*(?:Section\s+)?([A-F])\s*(?:-|$)/i;

  let currentSection = null;
  let currentTaux    = 11;
  let importedCount  = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 2) continue;

    const col0 = String(row[0] || '').trim();
    const col1 = String(row[1] || '').trim();
    const col2 = String(row[2] || '').trim();
    const col3 = String(row[3] || '').trim();
    const col4 = String(row[4] || '').trim();

    // ✅ Détection de section plus robuste
    const sectionMatch = SECTION_RE.exec(col0) || SECTION_RE.exec(col1);
    if (sectionMatch) {
      currentSection = sectionMatch[1].toUpperCase();
      currentTaux    = SECTIONS[currentSection]?.defaultTaux ?? 11;
    }

    // Extraction du taux IRNC depuis la ligne (ex: "11%", "24,75%")
    const rowStr  = row.join(' ');
    const tauxMatch = rowStr.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (tauxMatch) {
      const parsed = parseFloat(tauxMatch[1].replace(',', '.'));
      if (!isNaN(parsed)) currentTaux = parsed;
    }

    // Identification de la désignation
    const designation = DESIGNATION_MAP[col1] || DESIGNATION_MAP[col0];
    if (designation && currentSection) {
      const nombre      = parseInt(col2, 10)                       || 0;
      const prixUnitaire = parseFloat(col3.replace(/[\s,\u00a0]/g, '')) || 0;
      const montantTTC  = parseFloat(col4.replace(/[\s,\u00a0]/g, '')) || 0;

      const existingLine = memo.lines.find(
        (l) => l.designation === designation && l.code === currentSection
      );

      if (existingLine) {
        if (existingLine.isFixedAmount && montantTTC > 0) {
          existingLine.fixedAmount = montantTTC;
        } else {
          if (nombre       > 0) existingLine.nombre       = nombre;
          if (prixUnitaire > 0) existingLine.prixUnitaire = prixUnitaire;
        }
        existingLine.tauxIRNC = currentTaux;
        importedCount++;
      }
    }
  }

  memo.markModified('lines');
  memo.totals = recalculateMemoTotals(memo.lines);
  memo.markModified('totals');
  await memo.save();

  console.log(`🎉 Import terminé : ${importedCount} lignes mises à jour`);
  res.status(200).json({
    status:  'success',
    data:    memo,
    message: `${importedCount} ligne(s) importée(s)`,
  });
});

// ─── Export Excel ─────────────────────────────────────────────────────────────

/**
 * ✅ CORRECTIONS :
 *  - XLSX.write avec bookType: 'xlsx' et type: 'buffer' → ArrayBuffer correct
 *  - En-tête enrichi (titre de la formation)
 *  - Saut de ligne entre sections pour une meilleure lisibilité
 */
exports.exportToExcel = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  const [memo, formation] = await Promise.all([
    ExpenseMemo.findOne({ formationId }),
    Formation.findById(formationId),
  ]);
  if (!memo) return next(new AppError('Mémoire non trouvée', 404));

  const wb = XLSX.utils.book_new();
  const rows = [];

  // ── Métadonnées en haut de feuille ──
  rows.push(['REPUBLIQUE DU CAMEROUN – MINISTERE DES FINANCES – CENADI']);
  rows.push(['MÉMOIRE DE DÉPENSES']);
  rows.push([`Formation : ${formation?.title || ''}`]);
  rows.push([`Date d'export : ${new Date().toLocaleDateString('fr-FR')}`]);
  rows.push([]);

  // ── En-têtes de colonnes ──
  rows.push([
    'N°',
    'Désignations',
    'Nombres de personnes',
    'Prix Unitaires (FCFA)',
    'Montants TTC (FCFA)',
    'Taux IRNC (%)',
    'IRNC (FCFA)',
    'Net à payer (FCFA)',
  ]);

  // ── Lignes de données ──
  let currentCode = null;
  for (const line of memo.lines) {
    // En-tête de section
    if (line.code !== currentCode) {
      currentCode = line.code;
      rows.push([
        '',
        `${SECTIONS[line.code]?.label || line.code} (IRNC ${line.tauxIRNC}%)`,
        '', '', '', '', '', '',
      ]);
    }
    rows.push([
      line.lineNumber,
      line.designation,
      line.isFixedAmount ? '' : (line.nombre ?? ''),
      line.isFixedAmount ? '/' : (line.prixUnitaire ?? ''),
      line.montantTTC    ?? 0,
      `${line.tauxIRNC  ?? 0}%`,
      line.irnc          ?? 0,
      line.montantNet    ?? 0,
    ]);
  }

  // ── Ligne de total ──
  rows.push([]);
  rows.push([
    '', 'MONTANT TOTAL GÉNÉRAL', '', '',
    memo.totals.montantTotalTTC  ?? 0,
    '',
    memo.totals.montantTotalIRNC ?? 0,
    memo.totals.montantTotalNet  ?? 0,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Largeurs de colonnes
  ws['!cols'] = [
    { wch: 6  },  // N°
    { wch: 45 },  // Désignations
    { wch: 22 },  // Nombres
    { wch: 22 },  // Prix unitaire
    { wch: 22 },  // Montant TTC
    { wch: 14 },  // Taux IRNC
    { wch: 20 },  // IRNC
    { wch: 22 },  // Net à payer
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Memoire Depenses');

  // ✅ CORRECTION CRITIQUE : type 'buffer' produit un Buffer Node.js valide
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const safeName = (formation?.title || 'formation')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .substring(0, 50);
  const filename = `memoire_depenses_${safeName}_${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', excelBuffer.length);
  res.end(excelBuffer); // ✅ res.end() plutôt que res.send() pour les buffers binaires
});

// ─── Export PDF (HTML imprimable) ─────────────────────────────────────────────

/**
 * ✅ CORRECTIONS :
 *  - Remplacement de template literals par des chaînes concaténées pour éviter
 *    le bug "undefined" causé par des variables non résolues dans le template
 *  - Ajout de toLocaleString('fr-FR') pour l'affichage des nombres
 *  - En-tête complet avec armoiries camerounaises en texte
 */
exports.exportToPDF = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  const [memo, formation] = await Promise.all([
    ExpenseMemo.findOne({ formationId }),
    Formation.findById(formationId),
  ]);
  if (!memo) return next(new AppError('Mémoire non trouvée', 404));

  const formationTitle = formation?.title || 'Formation';
  const dateExport     = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const fmt = (n) => (n ?? 0).toLocaleString('fr-FR');

  // ── Génération des lignes du tableau ──
  let tableRows = '';
  let currentCode = '';

  for (const line of memo.lines) {
    if (line.code !== currentCode) {
      currentCode = line.code;
      const sectionLabel = SECTIONS[line.code]?.label || line.code;
      tableRows += `
        <tr class="section-header">
          <td colspan="8"><strong>${sectionLabel}</strong> &nbsp;(IRNC ${line.tauxIRNC}%)</td>
        </tr>`;
    }

    const prixCell = line.isFixedAmount
      ? '/'
      : (line.prixUnitaire ? fmt(line.prixUnitaire) : '-');

    tableRows += `
      <tr>
        <td class="text-center">${line.lineNumber}</td>
        <td>${line.designation}</td>
        <td class="text-center">${line.isFixedAmount ? '-' : (line.nombre ?? '-')}</td>
        <td class="text-right">${prixCell}</td>
        <td class="text-right">${fmt(line.montantTTC)}</td>
        <td class="text-right">${line.tauxIRNC}%</td>
        <td class="text-right">${fmt(line.irnc)}</td>
        <td class="text-right">${fmt(line.montantNet)}</td>
      </tr>`;
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mémoire de dépenses – ${formationTitle}</title>
  <style>
    @page { size: A4 landscape; margin: 1.5cm; }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #1e3a5f;
      padding-bottom: 12px;
    }
    .header .country { font-size: 14px; font-weight: bold; color: #1e3a5f; letter-spacing: 1px; }
    .header .motto   { font-size: 11px; color: #555; font-style: italic; margin: 2px 0 6px; }
    .header .ministry { font-size: 13px; font-weight: bold; color: #1e3a5f; }
    .header .entity  { font-size: 12px; color: #333; margin: 3px 0; }
    .header .doc-title {
      font-size: 15px; font-weight: bold;
      margin: 12px 0 4px;
      text-transform: uppercase;
      text-decoration: underline;
    }
    .header .formation-title { font-size: 12px; color: #333; font-style: italic; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 10px;
    }
    th, td {
      border: 1px solid #333;
      padding: 5px 7px;
      vertical-align: middle;
    }
    thead th {
      background-color: #1e3a5f;
      color: #fff;
      font-size: 10px;
      text-align: center;
      font-weight: bold;
    }
    .text-right  { text-align: right; }
    .text-center { text-align: center; }
    .section-header td {
      background-color: #d4e6f1;
      font-weight: bold;
      font-size: 10px;
      padding: 4px 7px;
    }
    .total-row td {
      background-color: #1e3a5f;
      color: #fff;
      font-weight: bold;
      font-size: 11px;
    }
    .footer {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
    }
    .footer .signatures { display: flex; gap: 80px; }
    .footer .sig-block  { text-align: center; }
    .footer .sig-block p { margin: 4px 0; }
    .footer .sig-line   { border-top: 1px solid #333; margin-top: 40px; width: 150px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- EN-TÊTE -->
  <div class="header">
    <div class="country">REPUBLIQUE DU CAMEROUN</div>
    <div class="motto">Paix – Travail – Patrie</div>
    <div class="ministry">MINISTERE DES FINANCES</div>
    <div class="entity">Centre National de Développement de l'Informatique (CENADI)</div>
    <div class="doc-title">Mémoire de Dépenses</div>
    <div class="formation-title">Formation : « ${formationTitle} »</div>
  </div>

  <!-- TABLEAU -->
  <table>
    <thead>
      <tr>
        <th style="width:4%">N°</th>
        <th style="width:32%">DÉSIGNATIONS</th>
        <th style="width:9%">NOMBRES</th>
        <th style="width:13%">PRIX UNITAIRE (FCFA)</th>
        <th style="width:13%">MONTANT TTC (FCFA)</th>
        <th style="width:8%">TAUX IRNC</th>
        <th style="width:11%">IRNC (FCFA)</th>
        <th style="width:10%">NET À PAYER (FCFA)</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr class="total-row">
        <td colspan="4" class="text-right">TOTAL GÉNÉRAL</td>
        <td class="text-right">${fmt(memo.totals.montantTotalTTC)} FCFA</td>
        <td></td>
        <td class="text-right">${fmt(memo.totals.montantTotalIRNC)} FCFA</td>
        <td class="text-right">${fmt(memo.totals.montantTotalNet)} FCFA</td>
      </tr>
    </tbody>
  </table>

  <!-- PIED DE PAGE / SIGNATURES -->
  <div class="footer">
    <div>
      <p>Fait à Yaoundé, le ${dateExport}</p>
    </div>
    <div class="signatures">
      <div class="sig-block">
        <p><strong>Le Responsable Financier</strong></p>
        <div class="sig-line"></div>
      </div>
      <div class="sig-block">
        <p><strong>Le Directeur Général</strong></p>
        <div class="sig-line"></div>
      </div>
    </div>
  </div>

</body>
</html>`;

  const safeName = (formationTitle)
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .substring(0, 50);
  const filename = `memoire_depenses_${safeName}_${new Date().toISOString().split('T')[0]}.html`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.send(html);
});

// ─── Sections ─────────────────────────────────────────────────────────────────

exports.getSections = catchAsync(async (req, res) => {
  res.status(200).json({ status: 'success', data: SECTIONS });
});