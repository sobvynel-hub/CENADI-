/**
 * controllers/settingsController.js – Gestion des paramètres généraux
 * Contrôleur pour la gestion des paramètres de l'application
 */

const Settings = require('../models/Settings');

// Obtenir les paramètres complets
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.status(200).json({
      status: 'success',
      data: settings
    });
  } catch (error) {
    console.error('Erreur getSettings:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// Obtenir le statut d'accès public uniquement (léger)
exports.getPublicAccessStatus = async (req, res) => {
  try {
    let settings = await Settings.findOne().select('publicAccess app.name');
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        publicAccess: settings.publicAccess,
        app: {
          name: settings.app?.name,
        },
      },
    });
  } catch (error) {
    console.error('Erreur getPublicAccessStatus:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// Mettre à jour les paramètres
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    const { about, contact, footer, app, publicAccess } = req.body;
    
    // Mise à jour section À propos
    if (about) {
      if (about.title !== undefined) settings.about.title = about.title;
      if (about.description !== undefined) settings.about.description = about.description;
      if (about.mission !== undefined) settings.about.mission = about.mission;
      if (about.vision !== undefined) settings.about.vision = about.vision;
      if (about.values !== undefined) settings.about.values = about.values;
      if (about.training !== undefined) settings.about.training = about.training;
    }
    
    // Mise à jour section Contact
    if (contact) {
      if (contact.address !== undefined) settings.contact.address = contact.address;
      if (contact.phone !== undefined) settings.contact.phone = contact.phone;
      if (contact.email !== undefined) settings.contact.email = contact.email;
      if (contact.website !== undefined) settings.contact.website = contact.website;
    }
    
    // Mise à jour section Footer
    if (footer) {
      if (footer.companyName !== undefined) settings.footer.companyName = footer.companyName;
      if (footer.tagline !== undefined) settings.footer.tagline = footer.tagline;
      if (footer.copyrightText !== undefined) settings.footer.copyrightText = footer.copyrightText;
      if (footer.developerCredit !== undefined) settings.footer.developerCredit = footer.developerCredit;
      if (footer.socialLinks) {
        if (footer.socialLinks.facebook !== undefined) settings.footer.socialLinks.facebook = footer.socialLinks.facebook;
        if (footer.socialLinks.twitter !== undefined) settings.footer.socialLinks.twitter = footer.socialLinks.twitter;
        if (footer.socialLinks.linkedin !== undefined) settings.footer.socialLinks.linkedin = footer.socialLinks.linkedin;
        if (footer.socialLinks.youtube !== undefined) settings.footer.socialLinks.youtube = footer.socialLinks.youtube;
      }
    }
    
    // Mise à jour section Application
    if (app) {
      if (app.name !== undefined) settings.app.name = app.name;
      if (app.email !== undefined) settings.app.email = app.email;
    }

    // Mise à jour de l'accès public
    if (publicAccess) {
      if (publicAccess.enabled !== undefined) {
        if (typeof publicAccess.enabled !== 'boolean') {
          return res.status(400).json({
            status: 'fail',
            message: 'Le champ publicAccess.enabled doit être un booléen.',
          });
        }

        settings.publicAccess.enabled = publicAccess.enabled;
        settings.publicAccess.updatedAt = new Date();
        settings.publicAccess.updatedBy = req.user?._id || null;
      }

      if (publicAccess.message !== undefined) {
        settings.publicAccess.message = publicAccess.message;
      }
    }
    
    await settings.save();
    
    res.status(200).json({
      status: 'success',
      message: settings.publicAccess?.enabled === false 
        ? 'Mode lockdown activé - L\'espace public est bloqué' 
        : 'Paramètres mis à jour avec succès',
      data: settings
    });
    
  } catch (error) {
    console.error('Erreur updateSettings:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// Basculer le mode public (lockdown toggle)
exports.togglePublicAccess = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    // Inverser l'état
    const newState = !settings.publicAccess.enabled;
    settings.publicAccess.enabled = newState;
    settings.publicAccess.updatedAt = new Date();
    settings.publicAccess.updatedBy = req.user._id;
    
    // Mettre à jour le message si fourni
    if (req.body.message !== undefined) {
      settings.publicAccess.message = req.body.message;
    }
    
    await settings.save();
    
    res.status(200).json({
      status: 'success',
      message: newState 
        ? '🔓 Accès public réactivé - Le site est accessible à tous'
        : '🔒 Mode lockdown activé - Seuls les administrateurs peuvent accéder',
      data: {
        publicAccess: settings.publicAccess
      }
    });
    
  } catch (error) {
    console.error('Erreur togglePublicAccess:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Erreur lors du basculement du mode d\'accès',
      error: error.message 
    });
  }
};

// Activer le lockdown (bloquer l'accès public)
exports.enableLockdown = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    settings.publicAccess.enabled = false;
    settings.publicAccess.updatedAt = new Date();
    settings.publicAccess.updatedBy = req.user._id;
    
    if (req.body.message !== undefined) {
      settings.publicAccess.message = req.body.message;
    }
    
    await settings.save();
    
    res.status(200).json({
      status: 'success',
      message: '🔒 Mode lockdown activé - L\'espace public est bloqué',
      data: {
        publicAccess: settings.publicAccess
      }
    });
    
  } catch (error) {
    console.error('Erreur enableLockdown:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Erreur lors de l\'activation du lockdown',
      error: error.message 
    });
  }
};

// Désactiver le lockdown (réouvrir l'accès public)
exports.disableLockdown = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    settings.publicAccess.enabled = true;
    settings.publicAccess.updatedAt = new Date();
    settings.publicAccess.updatedBy = req.user._id;
    
    await settings.save();
    
    res.status(200).json({
      status: 'success',
      message: '🔓 Mode lockdown désactivé - L\'espace public est à nouveau accessible',
      data: {
        publicAccess: settings.publicAccess
      }
    });
    
  } catch (error) {
    console.error('Erreur disableLockdown:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Erreur lors de la désactivation du lockdown',
      error: error.message 
    });
  }
};