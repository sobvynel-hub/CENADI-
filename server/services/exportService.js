/**
 * services/exportService.js – Export de données (CSV/Excel)
 */

const csv = require('fast-csv');
const { Readable } = require('stream');

/**
 * Exporte des données au format CSV
 * @param {Array} data - Données à exporter
 * @param {Object} options - Options (headers, filename)
 * @returns {Promise<{buffer: Buffer, filename: string}>}
 */
const exportToCSV = async (data, options = {}) => {
  if (!data || data.length === 0) {
    const emptyBuffer = Buffer.from('');
    return { buffer: emptyBuffer, filename: options.filename || `export_${Date.now()}.csv` };
  }
  
  const headers = options.headers || Object.keys(data[0] || {});
  const filename = options.filename || `export_${Date.now()}.csv`;
  
  return new Promise((resolve, reject) => {
    const chunks = [];
    const csvStream = csv.format({ headers });
    
    csvStream.on('data', (chunk) => chunks.push(chunk));
    csvStream.on('end', () => resolve({ buffer: Buffer.concat(chunks), filename }));
    csvStream.on('error', reject);
    
    for (const row of data) {
      csvStream.write(row);
    }
    csvStream.end();
  });
};

/**
 * Exporte les formations
 */
const exportFormations = async (formations) => {
  const data = formations.map(f => ({
    Titre: f.title || '',
    Description: f.description || '',
    Formateur: f.trainer || '',
    DateDebut: f.startDate ? new Date(f.startDate).toLocaleDateString('fr-FR') : '',
    DateFin: f.endDate ? new Date(f.endDate).toLocaleDateString('fr-FR') : '',
    Lieu: f.location || '',
    Capacite: f.maxCapacity || 0,
    Inscrits: f.currentEnrolled || 0,
    Statut: f.status || '',
    Publique: f.isPublic ? 'Oui' : 'Non',
  }));
  
  return exportToCSV(data, { filename: 'formations.csv' });
};

/**
 * Exporte les utilisateurs
 */
const exportUsers = async (users) => {
  const data = users.map(u => ({
    Matricule: u.employeeId || '',
    Prenom: u.firstName || '',
    Nom: u.lastName || '',
    Email: u.email || '',
    Division: u.division || '',
    Poste: u.position || '',
    Telephone: u.phone || '',
    Role: u.role || 'employe',
    Actif: u.isActive ? 'Oui' : 'Non',
    DateCreation: u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '',
  }));
  
  return exportToCSV(data, { filename: 'utilisateurs.csv' });
};

/**
 * Exporte les inscriptions
 */
const exportEnrollments = async (enrollments) => {
  const data = enrollments.map(e => ({
    Employe: e.userId ? `${e.userId.firstName || ''} ${e.userId.lastName || ''}`.trim() : 'N/A',
    Formation: e.formationId?.title || 'N/A',
    DateInscription: e.registrationDate ? new Date(e.registrationDate).toLocaleDateString('fr-FR') : '',
    Statut: e.status || '',
    Present: e.attended ? 'Oui' : 'Non',
    Attestation: e.certificateIssued ? 'Oui' : 'Non',
  }));
  
  return exportToCSV(data, { filename: 'inscriptions.csv' });
};

/**
 * Exporte les attestations
 */
const exportCertificates = async (certificates) => {
  const data = certificates.map(c => ({
    Employe: c.userId ? `${c.userId.firstName || ''} ${c.userId.lastName || ''}`.trim() : 'N/A',
    Formation: c.formationId?.title || c.personalTrainingId?.trainingName || 'N/A',
    Source: c.source === 'enterprise' ? 'Entreprise' : 'Personnel',
    Numero: c.certificateNumber || '',
    DateDelivrance: c.issueDate ? new Date(c.issueDate).toLocaleDateString('fr-FR') : '',
  }));
  
  return exportToCSV(data, { filename: 'attestations.csv' });
};

module.exports = {
  exportToCSV,
  exportFormations,
  exportUsers,
  exportEnrollments,
  exportCertificates,
};