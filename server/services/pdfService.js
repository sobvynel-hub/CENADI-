/**
 * services/pdfService.js – Génération de PDF pour les attestations
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const logger = require('../utils/logger');

/**
 * Génère un PDF d'attestation
 * @param {Object} data - Données de l'attestation
 * @returns {Promise<string>} - Chemin du fichier PDF généré
 */
const generateCertificatePDF = async (data) => {
  const {
    userName,
    formationName,
    startDate,
    endDate,
    duration,
    certificateNumber,
    isPersonal = false,
    provider = null,
  } = data;
  
  // Formatage des dates
  const startDateStr = startDate ? new Date(startDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) : 'Non spécifiée';
  
  const endDateStr = endDate ? new Date(endDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) : 'Non spécifiée';
  
  // Génération du QR code
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certificateNumber}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
  
  // Template HTML du certificat
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Attestation ${certificateNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Arial', sans-serif;
          background: #f5f5f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 40px;
        }
        .certificate {
          width: 900px;
          background: white;
          border: 15px solid #22c55e;
          padding: 40px;
          position: relative;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .certificate::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 1px solid #22c55e;
          pointer-events: none;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #22c55e;
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        .title {
          text-align: center;
          font-size: 28px;
          color: #333;
          margin: 30px 0;
          text-transform: uppercase;
          font-weight: normal;
          letter-spacing: 2px;
        }
        .content {
          text-align: center;
          margin: 30px 0;
        }
        .content p {
          font-size: 18px;
          line-height: 2;
          color: #555;
        }
        .name {
          font-size: 32px;
          font-weight: bold;
          color: #22c55e;
          margin: 20px 0;
          text-transform: uppercase;
        }
        .formation {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 20px 0;
        }
        .details {
          background: #f9f9f9;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .details p {
          font-size: 14px;
          margin: 5px 0;
        }
        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .signature {
          text-align: center;
        }
        .signature-line {
          width: 200px;
          border-top: 1px solid #333;
          margin-top: 40px;
          margin-bottom: 10px;
        }
        .signature-text {
          font-size: 12px;
          color: #666;
        }
        .qr-code {
          text-align: center;
        }
        .qr-code img {
          width: 100px;
          height: 100px;
        }
        .qr-text {
          font-size: 10px;
          color: #999;
          margin-top: 5px;
        }
        .certificate-number {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="logo">CENADI</div>
          <div class="subtitle">Centre National de Digitalisation et d'Innovation</div>
        </div>
        
        <div class="title">ATTESTATION DE FORMATION</div>
        
        <div class="content">
          <p>Nous soussignés, attestons que</p>
          <div class="name">${userName || 'L\'employé'}</div>
          <p>a suivi avec succès la formation</p>
          <div class="formation">« ${formationName || 'Formation'} »</div>
          ${isPersonal && provider ? `<p>auprès de l'organisme <strong>${provider}</strong></p>` : ''}
        </div>
        
        <div class="details">
          <p><strong>Dates :</strong> du ${startDateStr} au ${endDateStr}</p>
          <p><strong>Durée :</strong> ${duration || 1} jour(s)</p>
          <p><strong>Numéro d'attestation :</strong> ${certificateNumber}</p>
        </div>
        
        <div class="footer">
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-text">Le Responsable Formation</div>
          </div>
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code">
            <div class="qr-text">Vérifier l'authenticité</div>
          </div>
        </div>
        
        <div class="certificate-number">
          Document certifié électroniquement
        </div>
      </div>
    </body>
    </html>
  `;
  
  let browser = null;
  try {
    // Configuration Puppeteer pour environnement de production
    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    };
    
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const outputDir = path.join(__dirname, '../uploads/certificates');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filename = `certificate_${certificateNumber}.pdf`;
    const filepath = path.join(outputDir, filename);
    
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });
    
    logger.info(`PDF généré: ${filepath}`);
    return filepath;
  } catch (error) {
    logger.error(`Erreur génération PDF: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = { generateCertificatePDF };