/**
 * services/qrcodeService.js – Génération de QR codes pour les présences
 */

const QRCode = require('qrcode');

/**
 * Génère un QR code pour une formation
 * @param {string} formationId - ID de la formation
 * @param {string} formationTitle - Titre de la formation
 * @returns {Promise<string>} - Data URL du QR code
 */
const generateFormationQRCode = async (formationId, formationTitle) => {
  const qrData = JSON.stringify({
    formationId,
    formationTitle,
    timestamp: Date.now(),
    type: 'attendance',
    secret: process.env.QR_SECRET || 'cenadi-qr-secret',
  });
  
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 300,
    color: {
      dark: '#22c55e',
      light: '#ffffff',
    },
  });
  
  return qrCodeDataUrl;
};

/**
 * Génère un QR code pour une attestation
 * @param {string} certificateNumber - Numéro de l'attestation
 * @returns {Promise<string>} - Data URL du QR code
 */
const generateCertificateQRCode = async (certificateNumber) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificateNumber}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 150,
  });
  
  return qrCodeDataUrl;
};

module.exports = {
  generateFormationQRCode,
  generateCertificateQRCode,
};