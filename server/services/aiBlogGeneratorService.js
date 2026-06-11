/**
 * services/aiBlogGeneratorService.js
 * Générateur d'articles - Version professionnelle
 */

const BlogPost = require('../models/BlogPost');
const Formation = require('../models/Formation');
const Enrollment = require('../models/Enrollment');
const Suggestion = require('../models/Suggestion');
const logger = require('../utils/logger');

class AIBlogGeneratorService {
  
  static generateSlug(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Article sur les formations les plus populaires
   */
  static async generateTrendingPost() {
    try {
      const popularFormations = await Enrollment.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: '$formationId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]);
      
      const formationIds = popularFormations.map(p => p._id);
      const formations = await Formation.find({ _id: { $in: formationIds } });
      
      if (formations.length === 0) {
        return this.generateDefaultTrendingPost();
      }
      
      let content = `Les données d'inscription des derniers mois révèlent un engouement particulier pour certaines formations. Voici les programmes les plus plébiscités par les agents du CENADI.

`;
      
      formations.forEach((f, i) => {
        const count = popularFormations.find(p => p._id.toString() === f._id.toString())?.count || 0;
        content += `${i+1}. ${f.title}\n`;
        content += `   • ${count} inscription${count > 1 ? 's' : ''} enregistrée${count > 1 ? 's' : ''}\n`;
        content += `   • Niveau requis : ${f.level || 'Tous niveaux'}\n`;
        content += `   • Animation par : ${f.trainer || 'Formateur certifié CENADI'}\n`;
        content += `   • Description : ${f.description?.substring(0, 200) || 'Formation certifiante reconnue par l\'administration'}\n\n`;
      });
      
      content += `Ces formations répondent aux besoins exprimés par les services et s'inscrivent dans la politique de modernisation de l'administration. Les prochaines sessions seront programmées en fonction de la demande.\n`;
      
      const title = `Palmarès des formations les plus suivies`;
      
      return {
        title,
        excerpt: `${formations.length} formations se distinguent par leur taux de participation élevé. Découvrez les programmes plébiscités par vos collègues.`,
        content,
        category: 'trending',
        tags: ['formation', 'tendance', 'palmarès'],
        source: 'auto_generated',
      };
    } catch (error) {
      logger.error('Erreur génération article tendances:', error);
      return this.generateDefaultTrendingPost();
    }
  }

  static generateDefaultTrendingPost() {
    return {
      title: 'Les formations qui répondent aux besoins du secteur public',
      excerpt: 'Découvrez les domaines de compétence les plus recherchés dans l\'administration camerounaise.',
      content: `L'analyse des besoins en formation des agents publics met en évidence plusieurs domaines prioritaires.

1. Cybersécurité et protection des données
   Face à la digitalisation croissante des services publics, la maîtrise des enjeux de cybersécurité est devenue indispensable. Les agents doivent être formés aux bonnes pratiques et à la protection des données sensibles.

2. Intelligence artificielle et transformation numérique
   L'IA offre des opportunités majeures pour simplifier les processus administratifs. Une montée en compétences est nécessaire pour accompagner cette transformation.

3. Cloud computing et infrastructures numériques
   La migration des services vers le cloud nécessite une expertise technique que les agents doivent acquérir progressivement.

4. Gestion de projet et méthodes agiles
   L'efficacité des projets publics repose sur une maîtrise solide des méthodes de gestion.

5. Leadership et management public
   Le renforcement des compétences managériales des cadres contribue à l'amélioration du service rendu aux usagers.

Ces formations seront progressivement intégrées au catalogue CENADI en fonction des besoins exprimés par les divisions.`,
      category: 'trending',
      tags: ['formation', 'compétences', 'administration'],
      source: 'auto_generated',
    };
  }

  /**
   * Article basé sur les suggestions des employés
   */
  static async generateFromSuggestions() {
    try {
      const suggestions = await Suggestion.find({ 
        status: { $in: ['approved', 'pending'] }
      })
        .sort({ votes: -1 })
        .limit(3);
      
      if (suggestions.length === 0) {
        return this.generateDefaultSuggestionPost();
      }
      
      let content = `Dans le cadre de l'amélioration continue de l'offre de formation, les agents du CENADI ont proposé plusieurs thématiques. Voici celles qui ont recueilli le plus de suffrages.

`;
      
      suggestions.forEach((s, i) => {
        content += `${i+1}. ${s.title}\n`;
        content += `   • ${s.votes || 0} vote${s.votes > 1 ? 's' : ''} exprimé${s.votes > 1 ? 's' : ''}\n`;
        content += `   • Proposé par : ${s.suggestedByName || 'Agent CENADI'}\n`;
        content += `   • Description : ${s.description.substring(0, 250)}${s.description.length > 250 ? '...' : ''}\n`;
        if (s.reason) content += `   • Justification : ${s.reason.substring(0, 150)}...\n`;
        content += `\n`;
      });
      
      content += `Ces suggestions seront étudiées par la direction. Les agents sont invités à voter pour les propositions qui les intéressent afin d'orienter les choix pédagogiques.\n`;
      
      const title = `Suggestions de formations proposées par les agents`;
      
      return {
        title,
        excerpt: `${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''} de formation ${suggestions.length > 1 ? 'ont été' : 'a été'} proposée${suggestions.length > 1 ? 's' : ''} par les agents. Participez au vote pour orienter les futurs programmes.`,
        content,
        category: 'suggestion',
        tags: ['suggestion', 'agents', 'participation'],
        source: 'auto_generated',
      };
    } catch (error) {
      logger.error('Erreur génération article suggestions:', error);
      return this.generateDefaultSuggestionPost();
    }
  }

  static generateDefaultSuggestionPost() {
    return {
      title: 'Participez à la construction du catalogue de formation',
      excerpt: 'Vos suggestions sont essentielles pour adapter l\'offre de formation aux besoins réels des services.',
      content: `Le CENADI invite l'ensemble des agents à proposer des thématiques de formation répondant aux besoins de leurs services.

Comment formuler une suggestion ?

1. Connectez-vous à votre espace personnel sur la plateforme CENADI Formation
2. Accédez à la rubrique "Suggestions"
3. Remplissez le formulaire en précisant le titre, la description et les bénéfices attendus
4. Partagez votre suggestion avec vos collègues pour recueillir des votes

Chaque suggestion fait l'objet d'une analyse par l'équipe pédagogique. Les propositions les plus pertinentes et les plus soutenues seront intégrées au programme de formation.

La participation de tous est essentielle pour construire une offre de formation adaptée aux réalités du terrain.`,
      category: 'suggestion',
      tags: ['suggestion', 'participation', 'catalogue'],
      source: 'auto_generated',
    };
  }

  /**
   * Article sur les formations à venir
   */
  static async generateUpcomingPost() {
    try {
      const upcomingFormations = await Formation.find({
        isPublic: true,
        status: 'upcoming',
        startDate: { $gte: new Date() }
      })
        .sort({ startDate: 1 })
        .limit(3);
      
      if (upcomingFormations.length === 0) {
        return this.generateDefaultUpcomingPost();
      }
      
      let content = `Plusieurs sessions de formation sont programmées dans les prochaines semaines. Les inscriptions sont ouvertes.

`;
      
      upcomingFormations.forEach((f, i) => {
        const date = new Date(f.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        content += `${i+1}. ${f.title}\n`;
        content += `   • Date : ${date}\n`;
        content += `   • Lieu : ${f.location || 'À déterminer'}\n`;
        content += `   • Animation : ${f.trainer || 'Formateur certifié'}\n`;
        content += `   • Niveau : ${f.level || 'Tous niveaux'}\n`;
        content += `   • Programme : ${f.objectives?.substring(0, 200) || 'Formation certifiante'}\n\n`;
      });
      
      content += `Les inscriptions sont à effectuer via la plateforme. Le nombre de places étant limité, il est recommandé de s'inscrire sans délai.\n`;
      
      const title = `Programme des formations à venir`;
      
      return {
        title,
        excerpt: `${upcomingFormations.length} session${upcomingFormations.length > 1 ? 's' : ''} de formation ${upcomingFormations.length > 1 ? 'sont' : 'est'} programmée${upcomingFormations.length > 1 ? 's' : ''}. Consultez le calendrier et inscrivez-vous.`,
        content,
        category: 'upcoming',
        tags: ['calendrier', 'formation', 'inscription'],
        source: 'auto_generated',
      };
    } catch (error) {
      logger.error('Erreur génération article à venir:', error);
      return this.generateDefaultUpcomingPost();
    }
  }

  static generateDefaultUpcomingPost() {
    return {
      title: 'Calendrier des formations',
      excerpt: 'Découvrez les prochaines sessions de formation programmées par le CENADI.',
      content: `Le CENADI propose régulièrement des sessions de formation adaptées aux besoins des agents. Le calendrier est actualisé en fonction des demandes exprimées par les divisions.

Pour consulter les prochaines sessions et vous inscrire, rendez-vous dans la rubrique "Formations" de votre espace personnel.

Les inscriptions sont ouvertes dans la limite des places disponibles. Un agent ne peut s'inscrire qu'à une seule formation à la fois afin de garantir une répartition équitable des places.

De nouvelles sessions seront programmées en fonction des besoins exprimés par les services. N'hésitez pas à consulter régulièrement le catalogue.`,
      category: 'upcoming',
      tags: ['calendrier', 'formation', 'inscription'],
      source: 'auto_generated',
    };
  }

  /**
   * Article sur les formations externes (autres ministères)
   */
  static async generateExternalPost() {
    const externalFormations = [
      {
        title: "Cybersécurité et protection des données",
        organization: "MINFI - Agence Nationale de Sécurité Informatique",
        description: "Programme de formation aux enjeux de cybersécurité et à la protection des données à caractère personnel.",
        period: "Octobre - Novembre 2025",
        location: "Yaoundé / En ligne",
        contact: "Direction des Ressources Humaines du MINFI",
      },
      {
        title: "Certification en gestion de projets (PMP)",
        organization: "MINMAP - École Nationale d'Administration",
        description: "Préparation à la certification internationale PMP (Project Management Professional).",
        period: "Septembre - Décembre 2025",
        location: "Yaoundé",
        contact: "Service Formation Continue du MINMAP",
      },
      {
        title: "Data science pour l'administration publique",
        organization: "MINRESI - Institut de Recherche",
        description: "Utilisation des données massives pour l'aide à la décision administrative.",
        period: "Novembre 2025",
        location: "En ligne",
        contact: "Département de la Formation du MINRESI",
      },
      {
        title: "Communication publique et relations médias",
        organization: "MINCOM - Centre de Formation aux Métiers de la Communication",
        description: "Maîtrise des outils de communication institutionnelle et gestion des relations avec les médias.",
        period: "Octobre 2025",
        location: "Yaoundé",
        contact: "Cellule Formation du MINCOM",
      },
    ];
    
    let content = `Dans le cadre de la mutualisation des ressources publiques, plusieurs ministères proposent des programmes de formation ouverts aux agents d'autres administrations.

`;
    
    externalFormations.forEach((f, i) => {
      content += `${i+1}. ${f.title}\n`;
      content += `   • Organisateur : ${f.organization}\n`;
      content += `   • Période : ${f.period}\n`;
      content += `   • Lieu : ${f.location}\n`;
      content += `   • Contenu : ${f.description}\n`;
      content += `   • Renseignements : ${f.contact}\n\n`;
    });
    
    content += `Les agents intéressés sont invités à prendre attache auprès des services mentionnés pour obtenir les modalités d'inscription et les conditions de participation.\n`;
    
    return {
      title: `Offres de formation interministérielles`,
      excerpt: `Découvrez les formations organisées par ${externalFormations.map(f => f.organization.split(' - ')[0]).join(', ')} et accessibles aux agents publics.`,
      content,
      category: 'external',
      tags: ['interministériel', 'formation', 'mutualisation'],
      source: 'auto_generated',
    };
  }

  /**
   * Exécute la génération automatique complète
   */
  static async runAutoGeneration() {
    logger.info('Démarrage de la génération automatique d\'articles...');
    const results = [];
    
    const generators = [
      { name: 'tendances', fn: this.generateTrendingPost.bind(this) },
      { name: 'suggestions', fn: this.generateFromSuggestions.bind(this) },
      { name: 'upcoming', fn: this.generateUpcomingPost.bind(this) },
      { name: 'external', fn: this.generateExternalPost.bind(this) },
    ];
    
    for (const generator of generators) {
      try {
        const existing = await BlogPost.findOne({
          category: generator.name === 'tendances' ? 'trending' : generator.name,
          source: 'auto_generated',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        
        if (!existing) {
          const postData = await generator.fn();
          if (postData) {
            const slug = this.generateSlug(postData.title);
            
            let finalSlug = slug;
            let counter = 1;
            while (await BlogPost.findOne({ slug: finalSlug })) {
              finalSlug = `${slug}-${counter++}`;
            }
            
            const post = await BlogPost.create({
              ...postData,
              slug: finalSlug,
              status: 'published',
              publishedAt: new Date(),
              author: 'Direction de la Formation - CENADI',
              views: 0,
              likes: 0,
              source: 'auto_generated',
            });
            results.push({ type: generator.name, id: post._id, title: post.title });
            logger.info(`Article généré: ${post.title}`);
          }
        } else {
          logger.info(`Article déjà existant pour ${generator.name}`);
          results.push({ type: generator.name, title: existing.title, status: 'already_exists' });
        }
      } catch (error) {
        logger.error(`Erreur génération ${generator.name}:`, error);
      }
    }
    
    logger.info(`${results.filter(r => r.status !== 'already_exists').length} nouveaux articles générés`);
    return results;
  }
}

module.exports = AIBlogGeneratorService;