/**
 * controllers/blogController.js – Gestion des articles du blog
 */

const BlogPost = require('../models/BlogPost');
const Formation = require('../models/Formation');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Suggestion = require('../models/Suggestion');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { parsePagination, paginatedResponse, generateSlug } = require('../utils/helpers');

/**
 * Liste des articles publiés (public)
 */
exports.getPublishedPosts = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { category, tag, search } = req.query;

  const filter = { status: 'published' };
  
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [search] } },
    ];
  }
  if (tag) filter.tags = { $in: [tag] };

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit),
    BlogPost.countDocuments(filter),
  ]);

  res.status(200).json(paginatedResponse(posts, total, page, limit));
});

/**
 * Récupère un article par son slug (public)
 */
exports.getPostBySlug = catchAsync(async (req, res, next) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' });
  
  if (!post) {
    return next(new AppError('Article non trouvé', 404));
  }
  
  // Incrémenter les vues
  await BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
  
  res.status(200).json({
    status: 'success',
    data: post,
  });
});

/**
 * Récupère un article par ID (admin)
 */
exports.getPostById = catchAsync(async (req, res, next) => {
  const post = await BlogPost.findById(req.params.id);
  
  if (!post) {
    return next(new AppError('Article non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: post,
  });
});

/**
 * Liste tous les articles (admin)
 */
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, category, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BlogPost.countDocuments(filter),
  ]);

  res.status(200).json(paginatedResponse(posts, total, page, limit));
});

/**
 * Crée un article (admin)
 */
exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content, excerpt, category, tags, author, relatedFormationId, relatedSuggestionId, status } = req.body;
  
  const slug = generateSlug(title);
  
  const post = await BlogPost.create({
    title,
    slug,
    content,
    excerpt: excerpt || content.substring(0, 200),
    category: category || 'news',
    categoryLabel: getCategoryLabel(category),
    tags: tags || [],
    author: author || req.user?.firstName + ' ' + req.user?.lastName || 'CENADI Formation',
    authorId: req.user?._id,
    relatedFormationId,
    relatedSuggestionId,
    status: status || 'draft',
    coverImage: req.file ? req.file.path : null,
  });
  
  res.status(201).json({
    status: 'success',
    data: post,
  });
});

/**
 * Met à jour un article (admin)
 */
exports.updatePost = catchAsync(async (req, res, next) => {
  const { title, content, excerpt, category, tags, author, status } = req.body;
  
  const updateData = {};
  if (title) updateData.title = title;
  if (content) updateData.content = content;
  if (excerpt) updateData.excerpt = excerpt;
  if (category) updateData.category = category;
  if (category) updateData.categoryLabel = getCategoryLabel(category);
  if (tags) updateData.tags = tags;
  if (author) updateData.author = author;
  if (status) updateData.status = status;
  if (req.file) updateData.coverImage = req.file.path;
  
  if (title) updateData.slug = generateSlug(title);
  
  const post = await BlogPost.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  
  if (!post) {
    return next(new AppError('Article non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: post,
  });
});

/**
 * Supprime un article (admin)
 */
exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);
  
  if (!post) {
    return next(new AppError('Article non trouvé', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * ✅ Ajoute ou retire un like (toggle) - Accessible à tous les utilisateurs authentifiés
 */
exports.likePost = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.id;

  const post = await BlogPost.findById(postId);
  if (!post) {
    return next(new AppError('Article non trouvé', 404));
  }

  // Vérifier si l'utilisateur a déjà liké
  const alreadyLiked = post.likedBy && post.likedBy.includes(userId);

  let update;
  if (alreadyLiked) {
    // Retirer le like
    update = {
      $pull: { likedBy: userId },
      $inc: { likes: -1 }
    };
  } else {
    // Ajouter le like
    update = {
      $addToSet: { likedBy: userId },
      $inc: { likes: 1 }
    };
  }

  const updatedPost = await BlogPost.findByIdAndUpdate(
    postId,
    update,
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      likes: updatedPost.likes,
      liked: !alreadyLiked // Nouvel état
    }
  });
});

/**
 * Ajoute un commentaire
 */
exports.addComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  
  const comment = {
    userId: req.user?._id,
    userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Anonyme',
    content,
    createdAt: new Date(),
  };
  
  const post = await BlogPost.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: comment } },
    { new: true }
  );
  
  if (!post) {
    return next(new AppError('Article non trouvé', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: post.comments[post.comments.length - 1],
  });
});

/**
 * Statistiques du blog (admin)
 */
exports.getStats = catchAsync(async (req, res, next) => {
  const totalPosts = await BlogPost.countDocuments();
  const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
  const totalViews = await BlogPost.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
  const totalLikes = await BlogPost.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }]);
  const postsByCategory = await BlogPost.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      totalPosts,
      publishedPosts,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      postsByCategory,
    },
  });
});

// Helper
function getCategoryLabel(category) {
  const labels = {
    upcoming: 'À venir',
    trending: ' En tendance',
    feedback: ' Retours d\'expérience',
    external: ' Externe',
    suggestion: ' Suggestion',
    news: ' Actualité',
  };
  return labels[category] || ' Actualité';
}