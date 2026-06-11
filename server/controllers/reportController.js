const Formation   = require('../models/Formation');
const Enrollment  = require('../models/Enrollment');
const Attendance  = require('../models/Attendance');
const Certificate = require('../models/Certificate');
const ExpenseMemo = require('../models/ExpenseMemo');
const AppError    = require('../utils/AppError');
const catchAsync  = require('../utils/catchAsync');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const fmtNum  = (n) => (n ?? 0).toLocaleString('fr-FR');
const fmtPct  = (n) => `${Math.round(n ?? 0)} %`;

const STATUS_LABELS = {
  upcoming:  'À venir',
  ongoing:   'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const ENROLLMENT_STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
};

// ─── Contrôleur principal ─────────────────────────────────────────────────────

exports.generateFormationReport = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;

  // ── Récupération des données ──────────────────────────────────────────────
  const [formation, enrollments, attendances, expenseMemo] =
    await Promise.all([
      Formation.findById(formationId),
      Enrollment.find({ formationId }).populate('userId', 'firstName lastName email division position'),
      Attendance.find({ formationId }).populate('userId', 'firstName lastName'),
      ExpenseMemo.findOne({ formationId }),
    ]);

  if (!formation) return next(new AppError('Formation non trouvée', 404));

  // ── Calculs statistiques (sans attestations) ──────────────────────────────
  const totalEnrolled         = enrollments.length;
  const confirmedEnrollments  = enrollments.filter((e) => e.status === 'confirmed').length;
  const presentCount          = attendances.filter((a) => a.status === 'present').length;
  const attendanceRate        = totalEnrolled > 0 ? (presentCount / totalEnrolled) * 100 : 0;
  const totalBudget           = expenseMemo?.totals?.montantTotalNet ?? formation.budget ?? 0;
  const costPerParticipant    = totalEnrolled > 0 ? totalBudget / totalEnrolled : 0;

  // ── Construction du tableau des participants ──────────────────────────────
  const participantRows = enrollments.map((enr, idx) => {
    const user        = enr.userId;
    const hasAttended = attendances.some(
      (a) => String(a.userId?._id ?? a.userId) === String(user?._id) && a.status === 'present'
    );
    const statusLabel = ENROLLMENT_STATUS_LABELS[enr.status] ?? enr.status;

    return `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>${user?.lastName ?? '—'}</td>
        <td>${user?.firstName ?? '—'}</td>
        <td>${user?.division ?? '—'}</td>
        <td>${user?.email ?? '—'}</td>
        <td class="text-center">${hasAttended ? '✅' : '❌'}</td>
        <td class="text-center"><span class="status-badge status-${enr.status}">${statusLabel}</span></td>
      </tr>`;
  }).join('');

  // ── Construction du tableau de dépenses ───────────────────────────────────
  let expenseSection = '';
  if (expenseMemo && expenseMemo.lines?.length > 0) {
    let currentCode = '';
    const expenseRows = expenseMemo.lines.map((line) => {
      let sectionHeader = '';
      if (line.code !== currentCode) {
        currentCode = line.code;
        const sectionLabels = {
          A: 'A - SUPERVISION', B: 'B - COORDINATION', C: 'C - SECRÉTARIAT',
          D: 'D - DRH', E: 'E - TRANSPORT', F: 'F - FORMATEURS & PRESTATIONS'
        };
        sectionHeader = `
          <tr class="section-header">
            <td colspan="8"><strong>${sectionLabels[line.code] || line.sectionLabel || line.code}</strong> &nbsp;(IRNC ${line.tauxIRNC} %)</td>
          </tr>`;
      }
      const prix = line.isFixedAmount ? '/' : fmtNum(line.prixUnitaire);
      return `${sectionHeader}
        <tr>
          <td class="text-center">${line.lineNumber}</td>
          <td>${line.designation}</td>
          <td class="text-center">${line.isFixedAmount ? '—' : (line.nombre ?? '—')}</td>
          <td class="text-right">${prix}</td>
          <td class="text-right">${fmtNum(line.montantTTC)}</td>
          <td class="text-right">${line.tauxIRNC} %</td>
          <td class="text-right">${fmtNum(line.irnc)}</td>
          <td class="text-right">${fmtNum(line.montantNet)}</td>
        </tr>`;
    }).join('');

    expenseSection = `
      <section>
        <h2 class="section-title">5. MÉMOIRE DE DÉPENSES</h2>
        <table>
          <thead>
            <tr>
              <th style="width:5%">N°</th>
              <th style="width:30%">Désignation</th>
              <th style="width:9%">Nombres</th>
              <th style="width:12%">Prix unitaire (FCFA)</th>
              <th style="width:12%">Montant TTC (FCFA)</th>
              <th style="width:8%">Taux IRNC</th>
              <th style="width:12%">IRNC (FCFA)</th>
              <th style="width:12%">Net à payer (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            ${expenseRows}
            <tr class="total-row">
              <td colspan="4" class="text-right"><strong>TOTAL GÉNÉRAL</strong></td>
              <td class="text-right"><strong>${fmtNum(expenseMemo.totals.montantTotalTTC)} FCFA</strong></td>
              <td></td>
              <td class="text-right"><strong>${fmtNum(expenseMemo.totals.montantTotalIRNC)} FCFA</strong></td>
              <td class="text-right"><strong>${fmtNum(expenseMemo.totals.montantTotalNet)} FCFA</strong></td>
            </tr>
          </tbody>
        </table>
      </section>`;
  }

  // ── Objectifs / Programme ─────────────────────────────────────────────────
  const objectivesHtml = formation.objectives
    ? formation.objectives.split('\n').filter(Boolean).map((l) => `<li>${l}</li>`).join('')
    : '<li>Non renseignés</li>';

  const programHtml = formation.program
    ? `<pre class="program-pre">${formation.program}</pre>`
    : '<p class="empty-field">Non renseigné</p>';

  const prerequisitesHtml = formation.prerequisites?.length
    ? formation.prerequisites.map((p) => `<li>${p}</li>`).join('')
    : '<li>Aucun prérequis</li>';

  // ── Durée ─────────────────────────────────────────────────────────────────
  const durationDays = formation.startDate && formation.endDate
    ? Math.max(1, Math.ceil((new Date(formation.endDate) - new Date(formation.startDate)) / 86400000))
    : null;

  const dateGeneration = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // ── HTML complet avec thème VERT ──────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport de Formation – ${formation.title}</title>
  <style>
    /* ── Reset & base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 2cm; }

    body {
      font-family: 'Arial', Helvetica, sans-serif;
      font-size: 11px;
      color: #1a1a2e;
      background: #fff;
      line-height: 1.5;
    }

    /* ── En-tête officiel ── */
    .official-header {
      text-align: center;
      border-bottom: 3px double #16a34a;
      padding-bottom: 14px;
      margin-bottom: 20px;
    }
    .official-header .country {
      font-size: 15px; font-weight: bold; letter-spacing: 1.5px;
      color: #166534; text-transform: uppercase;
    }
    .official-header .motto   { font-size: 11px; color: #555; font-style: italic; margin: 3px 0 8px; }
    .official-header .ministry { font-size: 13px; font-weight: bold; color: #166534; }
    .official-header .entity  { font-size: 11px; color: #333; margin: 3px 0; }
    .official-header .doc-type {
      display: inline-block;
      margin-top: 14px;
      font-size: 17px; font-weight: bold; letter-spacing: 2px;
      text-transform: uppercase;
      background: #15803d; color: #fff;
      padding: 6px 24px; border-radius: 4px;
    }
    .official-header .formation-name {
      margin-top: 8px; font-size: 13px; color: #333; font-style: italic;
    }

    /* ── Sections ── */
    section { margin-bottom: 22px; }
    .section-title {
      font-size: 13px; font-weight: bold;
      color: #fff; background: #15803d;
      padding: 6px 12px; border-radius: 3px;
      margin-bottom: 10px; letter-spacing: 0.5px;
    }

    /* ── Grilles d'informations ── */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
    .info-item { display: flex; gap: 6px; align-items: baseline; }
    .info-label { font-weight: bold; color: #555; white-space: nowrap; min-width: 110px; }
    .info-value { color: #1a1a2e; }

    /* ── Cartes de statistiques ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 4px;
    }
    .stat-card {
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 12px 10px;
      text-align: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }
    .stat-card .stat-value { font-size: 22px; font-weight: bold; color: #166534; }
    .stat-card .stat-label { font-size: 9px; color: #4b5563; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-card.accent .stat-value { color: #059669; }
    .stat-card.success .stat-value { color: #16a34a; }
    .stat-card.warning .stat-value { color: #ea580c; }

    /* ── Tableaux ── */
    table {
      width: 100%; border-collapse: collapse;
      font-size: 10px; margin-top: 4px;
    }
    th, td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: middle; }
    thead th {
      background: #166534; color: #fff;
      font-weight: bold; text-align: center; font-size: 9.5px;
    }
    tbody tr:nth-child(even) { background: #f0fdf4; }
    tbody tr:hover { background: #dcfce7; }
    .text-center { text-align: center; }
    .text-right  { text-align: right; }
    .section-header td { background: #bbf7d0; font-weight: bold; font-size: 10px; padding: 4px 7px; }
    .total-row td { background: #15803d; color: #fff; font-size: 10.5px; }

    /* ── Badges de statut ── */
    .status-badge {
      display: inline-block; padding: 2px 7px;
      border-radius: 12px; font-size: 9px; font-weight: bold;
    }
    .status-confirmed { background:#dcfce7; color:#15803d; }
    .status-pending   { background:#fef3c7; color:#92400e; }
    .status-cancelled { background:#fee2e2; color:#b91c1c; }
    .status-completed { background:#d1fae5; color:#065f46; }

    /* ── Section évaluation ── */
    .eval-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .eval-item {
      border-left: 4px solid #16a34a;
      padding: 10px 14px;
      background: linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%);
      border-radius: 8px;
    }
    .eval-item .eval-value { font-size: 24px; font-weight: bold; color: #15803d; }
    .eval-item .eval-label { font-size: 10px; color: #4b5563; margin-top: 4px; }

    /* ── Listes ── */
    ul { list-style: none; padding-left: 0; }
    ul li { padding: 3px 0 3px 16px; position: relative; }
    ul li::before { content: ""; position: absolute; left: 0; color: #16a34a; font-size: 10px; }

    /* ── Programme ── */
    .program-pre {
      white-space: pre-wrap; word-break: break-word;
      background: #f0fdf4; border: 1px solid #bbf7d0;
      padding: 12px; border-radius: 8px;
      font-family: inherit; font-size: 10.5px;
    }
    .empty-field { color: #9ca3af; font-style: italic; }

    /* ── Pied de page ── */
    .report-footer {
      margin-top: 30px;
      border-top: 2px solid #16a34a;
      padding-top: 15px;
    }
    .signatures {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 50px; margin-top: 15px;
    }
    .sig-block { text-align: center; }
    .sig-block p { font-weight: bold; font-size: 11px; margin-bottom: 4px; }
    .sig-block .sig-line {
      border-top: 1px solid #166534; margin: 40px auto 4px;
      width: 180px;
    }
    .sig-block .sig-name { font-size: 10px; color: #4b5563; }
    .generation-date { font-size: 9px; color: #9ca3af; text-align: center; margin-top: 20px; }

    /* ── Impression ── */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      section { page-break-inside: avoid; }
      .stat-card { background: #f0fdf4; }
    }
  </style>
</head>
<body>

  <!-- ═══════════════════════════════════════════════ EN-TÊTE OFFICIEL -->
  <header class="official-header">
    <div class="country">République du Cameroun</div>
    <div class="motto">Paix – Travail – Patrie</div>
    <div class="ministry">Ministère des Finances</div>
    <div class="entity">Centre National de Développement de l'Informatique (CENADI)</div>
    <div class="doc-type">Rapport de Formation</div>
    <div class="formation-name">« ${formation.title} »</div>
  </header>

  <!-- ═══════════════════════════════════════════ 1. INFORMATIONS GÉNÉRALES -->
  <section>
    <h2 class="section-title">1. INFORMATIONS GÉNÉRALES</h2>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Titre :</span>          <span class="info-value">${formation.title}</span></div>
      <div class="info-item"><span class="info-label">Statut :</span>         <span class="info-value">${STATUS_LABELS[formation.status] ?? formation.status}</span></div>
      <div class="info-item"><span class="info-label">Date de début :</span>  <span class="info-value">${fmtDate(formation.startDate)}</span></div>
      <div class="info-item"><span class="info-label">Date de fin :</span>    <span class="info-value">${fmtDate(formation.endDate)}</span></div>
      <div class="info-item"><span class="info-label">Durée :</span>          <span class="info-value">${durationDays ? durationDays + ' jour(s)' : '—'}</span></div>
      <div class="info-item"><span class="info-label">Lieu :</span>           <span class="info-value">${formation.location || '—'}</span></div>
      <div class="info-item"><span class="info-label">Capacité max :</span>   <span class="info-value">${formation.maxCapacity ?? '—'}</span></div>
      <div class="info-item"><span class="info-label">Formateur :</span>      <span class="info-value">${formation.trainer || '—'}</span></div>
      ${formation.trainerBio ? `<div class="info-item" style="grid-column:1/-1"><span class="info-label">Bio formateur :</span><span class="info-value">${formation.trainerBio}</span></div>` : ''}
      ${formation.description ? `<div class="info-item" style="grid-column:1/-1"><span class="info-label">Description :</span><span class="info-value">${formation.description}</span></div>` : ''}
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════ 2. STATISTIQUES CLÉS -->
  <section>
    <h2 class="section-title">2. STATISTIQUES CLÉS</h2>
    <div class="stats-grid">
      <div class="stat-card accent">
        <div class="stat-value">${totalEnrolled}</div>
        <div class="stat-label">Inscrits</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${confirmedEnrollments}</div>
        <div class="stat-label">Confirmés</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${fmtPct(attendanceRate)}</div>
        <div class="stat-label">Taux de présence</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">${fmtNum(totalBudget)}</div>
        <div class="stat-label">Budget net (FCFA)</div>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════ 3. OBJECTIFS ET PROGRAMME -->
  <section>
    <h2 class="section-title">3. OBJECTIFS ET PROGRAMME</h2>
    <p style="font-weight:bold;margin-bottom:6px;color:#166534"> Objectifs pédagogiques</p>
    <ul>${objectivesHtml}</ul>

    <p style="font-weight:bold;margin:12px 0 6px;color:#166534"> Programme détaillé</p>
    ${programHtml}
  </section>

  <!-- ══════════════════════════════════════════════ 4. LISTE DES PARTICIPANTS -->
  <section>
    <h2 class="section-title">4. LISTE DES PARTICIPANTS (${totalEnrolled})</h2>
    ${totalEnrolled === 0
      ? '<p class="empty-field">Aucun participant inscrit.</p>'
      : `<table>
          <thead>
            <tr>
              <th style="width:5%">N°</th>
              <th style="width:18%">Nom</th>
              <th style="width:18%">Prénom</th>
              <th style="width:18%">Division</th>
              <th style="width:25%">Email</th>
              <th style="width:8%">Présence</th>
              <th style="width:8%">Statut</th>
            </tr>
          </thead>
          <tbody>${participantRows}</tbody>
        </table>`
    }
  </section>

  <!-- ══════════════════════════════════════════════════ 5. DÉPENSES (conditionnel) -->
  ${expenseSection}

  <!-- ══════════════════════════════════════════════ 6. ÉVALUATION ET SYNTHÈSE -->
  <section>
    <h2 class="section-title">6. ÉVALUATION ET SYNTHÈSE</h2>
    <div class="eval-grid">
      <div class="eval-item">
        <div class="eval-value">${fmtPct(attendanceRate)}</div>
        <div class="eval-label">Taux de participation</div>
      </div>
      <div class="eval-item">
        <div class="eval-value">${totalEnrolled > 0 ? fmtNum(Math.round(costPerParticipant)) + ' FCFA' : '—'}</div>
        <div class="eval-label">Coût par participant</div>
      </div>
      <div class="eval-item">
        <div class="eval-value">${formation.status === 'completed' ? ' Terminée' : formation.status === 'ongoing' ? ' En cours' : ' À venir'}</div>
        <div class="eval-label">Statut de la formation</div>
      </div>
    </div>

    <table style="margin-top:16px">
      <thead>
        <tr>
          <th>Indicateur</th>
          <th>Valeur</th>
          <th>Commentaire</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Nombre total d'inscrits</td>
          <td class="text-center">${totalEnrolled}</td>
          <td>${totalEnrolled >= (formation.maxCapacity ?? Infinity) ? ' Formation complète' : ' Places disponibles'}</td>
        </tr>
        <tr>
          <td>Présents le jour J</td>
          <td class="text-center">${presentCount} / ${totalEnrolled}</td>
          <td>${attendanceRate >= 80 ? ' Bon taux de présence' : attendanceRate >= 50 ? ' Présence moyenne' : ' Faible présence'}</td>
        </tr>
        <tr>
          <td>Budget total net</td>
          <td class="text-right">${fmtNum(totalBudget)} FCFA</td>
          <td>${expenseMemo ? ' Mémoire de dépenses disponible' : ' Estimé sur le budget formation'}</td>
        </tr>
        <tr>
          <td>Coût moyen par participant</td>
          <td class="text-right">${totalEnrolled > 0 ? fmtNum(Math.round(costPerParticipant)) + ' FCFA' : '—'}</td>
          <td>Calculé sur la base du budget net</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- ════════════════════════════════════════════════════════ 7. SIGNATURES -->
  <div class="report-footer">
    <div class="signatures">
      <div class="sig-block">
        <p>Le Responsable de la Formation</p>
        <div class="sig-line"></div>
        <div class="sig-name">${formation.trainer || '____________________'}</div>
      </div>
      <div class="sig-block">
        <p>Le Directeur Général du CENADI</p>
        <div class="sig-line"></div>
        <div class="sig-name">____________________</div>
      </div>
    </div>
    <p class="generation-date"> Rapport généré automatiquement le ${dateGeneration} par le Système CENADI Formation</p>
  </div>

  <script>
    if (new URLSearchParams(window.location.search).get('print') === '1') {
      window.addEventListener('load', () => setTimeout(() => window.print(), 600));
    }
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline');
  res.send(html);
});