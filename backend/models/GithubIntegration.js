// models/GithubIntegration.js
const mongoose = require('mongoose');

const githubIntegrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  githubUsername: {
    type: String,
    required: true
  },
  repositories: [{
    name: String,
    owner: String,
    url: String,
    lastSynced: Date
  }],
  webhookId: String,
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('GithubIntegration', githubIntegrationSchema);