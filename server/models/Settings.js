const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    about: {
      title: { type: String, default: 'À propos de CENADI' },
      description: { type: String, default: 'Le Centre National de Développement Informatique (CENADI) est un établissement public camerounais chargé de la conception et de la mise en œuvre de la politique informatique de l\'État.' },
      mission: { type: String, default: 'Informatiser les administrations publiques et contribuer au développement numérique du Cameroun.' },
      vision: { type: String, default: 'Devenir le centre d\'excellence en matière d\'innovation numérique pour le secteur public.' },
      values: { type: String, default: 'Excellence, intégrité, innovation et service public au cœur de toutes nos actions.' },
      training: { type: String, default: 'Nous accompagnons nos employés dans leur développement professionnel continu.' },
    },
    contact: {
      address: { type: String, default: 'BP 13011, Yaoundé, Cameroun' },
      phone: { type: String, default: '+237 222 20 68 60' },
      email: { type: String, default: 'contact@cenadi.cm' },
      website: { type: String, default: 'www.cenadi.cm' },
    },
    footer: {
      companyName: { type: String, default: 'CENADI' },
      tagline: { type: String, default: 'Centre National de Développement Informatique — Plateforme de gestion des formations professionnelles.' },
      copyrightText: { type: String, default: 'Tous droits réservés' },
      developerCredit: { type: String, default: 'Développé pour la gestion des formations CENADI' },
      socialLinks: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        youtube: { type: String, default: '' },
      },
    },
    app: {
      name: { type: String, default: 'CENADI Formation' },
      email: { type: String, default: 'contact@cenadi.cm' },
    },
    publicAccess: {
      enabled: { type: Boolean, default: true },
      message: {
        type: String,
        default: 'L espace public est temporairement indisponible.',
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      updatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;
