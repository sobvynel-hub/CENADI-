/**
 * services/blogGeneratorService.js – Générateur automatique d'articles
 */

const BlogPost = require('../models/BlogPost');
const Formation = require('../models/Formation');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Suggestion = require('../models/Suggestion');
const { generateSlug } = require('../utils/helpers');

class BlogGeneratorService {
  /**
   * Génère un article sur les formations à venir
   */
  static async generateUpcomingFormationPost(formation) {
    const enrollmentsCount = await Enrollment.countDocuments({ formationId: formation._id });
    const totalCapacity = formation.maxCapacity || 0;
    const fillRate = totalCapacity > 0 ? Math.round((enrollmentsCount / totalCapacity) * 100) : 0;
    
    const title = `📅 ${formation.title} – Du ${new Date(formation.startDate).toLocaleDateString('fr-FR')} au ${new Date(formation.endDate).toLocaleDateString('fr-FR')}`;
    
    let content = `
## 🎯 Pourquoi suivre cette formation ?

${formation.description || 'Une formation complète pour développer vos compétences.'}

## 📊 À propos de cette session

- **Date de début** : ${new Date(formation.startDate).toLocaleDateString('fr-FR')}
- **Date de fin** : ${new Date(formation.endDate).toLocaleDateString('fr-FR')}
- **Lieu** : ${formation.location || 'À déterminer'}
- **Formateur** : ${formation.trainer || 'Expert CENADI'}
- **Niveau** : ${formation.level || 'Tous niveaux'}

## 👥 Inscriptions

- **Inscrits** : ${enrollmentsCount} participant${enrollmentsCount > 1 ? 's' : ''}
- **Capacité** : ${totalCapacity || 'Illimitée'}
- **Taux de remplissage** : ${fillRate}%

`;

    if (formation.objectives) {
      content += `\n## 🎓 Objectifs de la formation\n\n${formation.objectives}\n`;
    }
    
    if (formation.program) {
      content += `\n## 📚 Programme\n\n${formation.program}\n`;
    }
    
    content += `\n## ✨ Ne manquez pas cette opportunité !

Inscrivez-vous dès maintenant pour garantir votre place.`;

    return {
      title,
      excerpt: `${formation.title} – Formation ${fillRate >= 80 ? 'très demandée' : 'ouverte'} du ${new Date(formation.startDate).toLocaleDateString('fr-FR')}`,
      content,
      category: 'upcoming',
      tags: ['formation', 'à venir', formation.level, formation.trainer],
      relatedFormationId: formation._id,
      source: 'auto_generated',
      stats: {
        formationsCount: 1,
        enrollmentsCount,
        popularityScore: fillRate,
      },
    };
  }

  /**
   * Génère un article sur les tendances (formations populaires)
   */
  static async generateTrendingPost() {
    const popularFormations = await Enrollment.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$formationId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    
    const formationIds = popularFormations.map(p => p._id);
    const formations = await Formation.find({ _id: { $in: formationIds } });
    
    const topFormations = formations.map(f => ({
      title: f.title,
      count: popularFormations.find(p => p._id.toString() === f._id.toString())?.count || 0,
    }));
    
    const title = '🔥 Top 5 des formations les plus demandées';
    
    let content = `
## Les formations qui cartonnent en ce moment

Découvrez les formations qui suscitent le plus d'intérêt auprès de vos collègues.

`;

    topFormations.forEach((f, i) => {
      content += `### ${i + 1}. ${f.title}\n`;
      content += `- **${f.count} inscription${f.count > 1 ? 's' : ''}**\n\n`;
    });
    
    content += `
## Pourquoi ces formations sont-elles populaires ?

Ces formations répondent aux besoins actuels du marché et permettent d'acquérir des compétences très recherchées.

**Ne manquez pas les prochaines sessions !**
`;
    
    return {
      title,
      excerpt: `${topFormations.length} formations en tendance – Découvrez ce qui intéresse vos collègues`,
      content,
      category: 'trending',
      tags: ['tendance', 'populaire', 'formations'],
      source: 'auto_generated',
    };
  }

  /**
   * Génère un article à partir d'une suggestion approuvée
   */
  static async generateFromSuggestion(suggestion) {
    const user = suggestion.suggestedBy;
    
    const title = `💡 Suggestion : ${suggestion.title}`;
    
    const content = `
## Proposition de ${suggestion.suggestedByName || 'un collaborateur'}

**Division** : ${suggestion.suggestedByDivision || 'Non spécifiée'}

### 📝 Description

${suggestion.description}

### 🎯 Raison de la suggestion

${suggestion.reason}

${suggestion.expectedBenefits ? `### ✨ Bénéfices attendus\n\n${suggestion.expectedBenefits}\n` : ''}
${suggestion.targetAudience ? `### 👥 Public cible\n\n${suggestion.targetAudience}\n` : ''}

---

💬 **Donnez votre avis** : Cette formation vous intéresse-t-elle ? Faites-le nous savoir en commentaire !
`;
    
    return {
      title,
      excerpt: suggestion.description.substring(0, 200),
      content,
      category: 'suggestion',
      tags: ['suggestion', suggestion.category, suggestion.priority],
      relatedSuggestionId: suggestion._id,
      source: 'suggestion',
    };
  }

  /**
   * Génère un article sur les formations dans d'autres ministères
   */
  static async generateExternalPost() {
    // Ce contenu pourrait venir d'une API externe ou d'une source RSS
    const externalFormations = [
      {
        title: "Formation Cybersécurité - MINFI",
        description: "Le MINFI organise une formation sur la cybersécurité pour les agents du secteur public.",
        date: "Septembre 2025",
        source: "MINFI",
      },
      {
        title: "Certification Cloud AWS - MINPOSTEL",
        description: "Formation certifiante AWS proposée par le MINPOSTEL.",
        date: "Octobre 2025",
        source: "MINPOSTEL",
      },
    ];
    
    const title = '🏛️ Formations dans d\'autres ministères';
    
    let content = `
## Découvrez les formations proposées dans d'autres structures

Ces formations pourraient vous intéresser et sont ouvertes aux agents du secteur public.

`;
    externalFormations.forEach(f => {
      content += `### ${f.title}\n`;
      content += `**Source** : ${f.source}\n`;
      content += `**Date** : ${f.date}\n`;
      content += `${f.description}\n\n`;
    });
    
    content += `
---
💡 **Vous connaissez d'autres formations intéressantes ?** Faites-nous une suggestion !
`;
    
    return {
      title,
      excerpt: `Formations organisées par ${externalFormations.map(f => f.source).join(', ')} – À ne pas manquer`,
      content,
      category: 'external',
      tags: ['externe', 'ministère', 'opportunité'],
      source: 'external',
    };
  }

  /**
   * Génère un article sur les retours d'expérience
   */
  static async generateFeedbackPost() {
    const certificates = await Certificate.find()
      .populate('userId', 'firstName lastName division')
      .limit(5)
      .sort({ createdAt: -1 });
    
    if (certificates.length === 0) return null;
    
    const title = '💬 Retours d\'expérience – Témoignages de vos collègues';
    
    let content = `
## Ils ont suivi une formation et témoignent

Découvrez les retours d'expérience de vos collègues.

`;
    certificates.forEach(cert => {
      content += `### 🎓 ${cert.userId?.firstName || ''} ${cert.userId?.lastName || ''} – ${cert.userId?.division || ''}\n`;
      content += `"Cette formation m'a permis d'acquérir de nouvelles compétences et d'évoluer dans mon poste."\n\n`;
    });
    
    content += `
---
✨ **Inspirez-vous de ces témoignages et rejoignez les prochaines formations !**
`;
    
    return {
      title,
      excerpt: `Découvrez ce que disent vos collègues de leurs formations`,
      content,
      category: 'feedback',
      tags: ['témoignage', 'retour', 'expérience'],
      source: 'auto_generated',
    };
  }

  /**
   * Exécute toutes les générations automatiques
   */
  static async runAutoGeneration() {
    console.log('🚀 Démarrage de la génération automatique d\'articles...');
    
    const results = [];
    
    // 1. Générer articles pour les formations à venir
    const upcomingFormations = await Formation.find({ isPublic: true, status: 'upcoming' }).limit(3);
    for (const formation of upcomingFormations) {
      const existing = await BlogPost.findOne({ relatedFormationId: formation._id, source: 'auto_generated' });
      if (!existing) {
        const postData = await this.generateUpcomingFormationPost(formation);
        const slug = generateSlug(postData.title);
        await BlogPost.create({ ...postData, slug, status: 'published' });
        results.push(`Formation: ${formation.title}`);
      }
    }
    
    // 2. Générer article tendance
    const trendingExists = await BlogPost.findOne({ category: 'trending', source: 'auto_generated', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    if (!trendingExists) {
      const trendingPost = await this.generateTrendingPost();
      if (trendingPost) {
        const slug = generateSlug(trendingPost.title);
        await BlogPost.create({ ...trendingPost, slug, status: 'published' });
        results.push('Article tendance');
      }
    }
    
    // 3. Générer article suggestions approuvées
    const approvedSuggestions = await Suggestion.find({ status: 'approved' }).limit(2);
    for (const suggestion of approvedSuggestions) {
      const existing = await BlogPost.findOne({ relatedSuggestionId: suggestion._id });
      if (!existing) {
        const postData = await this.generateFromSuggestion(suggestion);
        const slug = generateSlug(postData.title);
        await BlogPost.create({ ...postData, slug, status: 'published' });
        results.push(`Suggestion: ${suggestion.title}`);
        
        // Marquer comme implémentée
        await Suggestion.findByIdAndUpdate(suggestion._id, { status: 'implemented' });
      }
    }
    
    // 4. Générer article externe (1 fois par mois)
    const externalExists = await BlogPost.findOne({ category: 'external', source: 'external', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    if (!externalExists) {
      const externalPost = await this.generateExternalPost();
      const slug = generateSlug(externalPost.title);
      await BlogPost.create({ ...externalPost, slug, status: 'published' });
      results.push('Article externe');
    }
    
    console.log(`✅ ${results.length} articles générés :`, results);
    return results;
  }
}

module.exports = BlogGeneratorService;