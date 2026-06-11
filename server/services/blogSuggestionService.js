/**
 * services/blogSuggestionService.js – Service de suggestions
 */

const BlogPost = require('../models/BlogPost');
const Formation = require('../models/Formation');
const logger = require('../utils/logger');

class BlogSuggestionService {
  
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

  static async analyzeExistingFormations() {
    const formations = await Formation.find({ isPublic: true });
    return [{ title: 'Analyse des formations', reason: `${formations.length} formations disponibles` }];
  }

  static async generateMarketTrends() {
    return [
      { title: "Cybersécurité", demandLevel: "high" },
      { title: "Intelligence Artificielle", demandLevel: "high" },
      { title: "Cloud Computing", demandLevel: "medium" }
    ];
  }

  static async generateExternalTrainings() {
    return [
      { title: "Formation externe 1", organization: "MINFI", period: "2025" },
      { title: "Formation externe 2", organization: "MINMAP", period: "2025" }
    ];
  }

  static async generateAndPublishSuggestions() {
    logger.info('🚀 Génération des suggestions...');
    const publishedPosts = [];

    const defaultPosts = [
      {
        title: 'Bienvenue sur le blog CENADI',
        content: '## Bienvenue sur notre blog !\n\nCe blog est dédié aux actualités et tendances en formation.',
        excerpt: 'Découvrez toutes les actualités formation',
        category: 'news',
        tags: ['bienvenue']
      },
      {
        title: '🔥 Tendances formation 2025',
        content: '## Les formations qui recrutent\n\nDécouvrez les domaines porteurs.',
        excerpt: 'Les tendances à connaître',
        category: 'trending',
        tags: ['tendances']
      },
      {
        title: '📅 Formations à venir',
        content: '## Ne manquez pas nos formations\n\nInscrivez-vous dès maintenant.',
        excerpt: 'Prochaines sessions',
        category: 'upcoming',
        tags: ['à venir']
      }
    ];

    for (const postData of defaultPosts) {
      const existing = await BlogPost.findOne({ title: postData.title });
      if (!existing) {
        const slug = this.generateSlug(postData.title);
        const post = await BlogPost.create({
          ...postData,
          slug,
          status: 'published',
          publishedAt: new Date(),
          author: 'CENADI Formation',
          source: 'auto_generated',
          views: 0,
          likes: 0
        });
        publishedPosts.push({ title: post.title });
        logger.info(`✅ Article généré: ${post.title}`);
      }
    }

    return publishedPosts;
  }
}

module.exports = BlogSuggestionService;