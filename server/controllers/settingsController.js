const Settings = require('../models/Settings');

// Obtenir les paramètres
exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.status(200).json({
      status: 'success',
      data: settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour les paramètres
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    const { about, contact, footer, app } = req.body;
    
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
    
    await settings.save();
    
    res.status(200).json({
      status: 'success',
      data: settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};