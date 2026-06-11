/**
 * controllers/aiBlogController.js
 * Contrôleur pour la génération IA d'articles
 */

const AIBlogGeneratorService = require('../services/aiBlogGeneratorService');
const BlogPost = require('../models/BlogPost');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Déclencher la génération automatique d'articles
 */
exports.triggerAutoGeneration = catchAsync(async (req, res, next) => {
  const results = await AIBlogGeneratorService.runAutoGeneration();
  
  res.status(200).json({
    status: 'success',
    message: `${results.length} articles générés`,
    data: results,
  });
});

/**
 * Générer un article spécifique
 */
exports.generateSpecificPost = catchAsync(async (req, res, next) => {
  const { type } = req.params;
  
  let postData = null;
  
  switch (type) {
    case 'trending':
      postData = await AIBlogGeneratorService.generateTrendingPost();
      break;
    case 'suggestions':
      postData = await AIBlogGeneratorService.generateFromSuggestions();
      break;
    case 'external':
      postData = await AIBlogGeneratorService.generateExternalPost(req.body.externalData);
      break;
    case 'upcoming':
      postData = await AIBlogGeneratorService.generateUpcomingPost();
      break;
    case 'feedback':
      postData = await AIBlogGeneratorService.generateFeedbackPost();
      break;
    default:
      return next(new AppError('Type d\'article invalide', 400));
  }
  
  if (!postData) {
    return next(new AppError('Impossible de générer l\'article', 400));
  }
  
  const slug = AIBlogGeneratorService.generateSlug(postData.title);
  
  const post = await BlogPost.create({
    ...postData,
    slug,
    status: 'draft',
    source: 'ai_generated',
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Article généré avec succès',
    data: post,
  });
});

/**
 * Améliorer un article existant avec IA
 */
exports.improvePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await BlogPost.findById(id);
  
  if (!post) {
    return next(new AppError('Article non trouvé', 404));
  }
  
  const openai = require('openai');
  const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
  
  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Améliore cet article de blog: corrige les fautes, améliore le style, ajoute des sous-titres.' },
      { role: 'user', content: post.content }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });
  
  const improvedContent = completion.choices[0].message.content;
  
  post.content = improvedContent;
  await post.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Article amélioré avec succès',
    data: post,
  });
});