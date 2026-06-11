/**
 * services/emailService.js – Service d'envoi d'emails
 */

const nodemailer = require('nodemailer');

// Configuration du transporteur email (optionnel - pour la production)
let transporter = null;

if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Envoi d'email de réinitialisation de mot de passe
 * En développement, affiche simplement le lien dans la console
 */
exports.sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  // En développement : afficher le lien dans la console
  if (process.env.NODE_ENV === 'development' || !transporter) {
    console.log('=========================================');
    console.log('📧 [DEV] Email de réinitialisation');
    console.log('   À envoyer à:', email);
    console.log('   Lien de réinitialisation:');
    console.log(`   ${resetUrl}`);
    console.log('=========================================');
    return;
  }

  // En production : envoyer un vrai email
  const mailOptions = {
    from: `"CENADI Formation" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Réinitialisation de votre mot de passe - CENADI Formation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1e40af; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">CENADI Formation</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1e293b;">Réinitialisation de votre mot de passe</h2>
          <p style="color: #475569;">Bonjour,</p>
          <p style="color: #475569;">
            Vous avez demandé la réinitialisation de votre mot de passe pour accéder à votre compte CENADI Formation.
          </p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color: #475569;">
            Ce lien est valable pendant <strong>10 minutes</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </p>
          <hr style="margin: 20px 0; border-color: #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br />
            <a href="${resetUrl}" style="color: #1e40af;">${resetUrl}</a>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};