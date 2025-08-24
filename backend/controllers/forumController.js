// controllers/forumController.js
const ForumPost = require('../models/ForumPost');

// Get all forum posts
exports.getPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'username')
      .populate('replies.author', 'username')
      .sort({ isPinned: -1, timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new forum post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = new ForumPost({
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      author: req.user.id
    });

    await post.save();
    await post.populate('author', 'username');

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single post
exports.getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'username')
      .populate('replies.author', 'username');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a reply to a post
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.replies.push({
      content,
      author: req.user.id
    });

    await post.save();
    await post.populate('replies.author', 'username');

    // Get the last reply (the one just added)
    const newReply = post.replies[post.replies.length - 1];

    res.status(201).json(newReply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};