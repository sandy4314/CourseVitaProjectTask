// controllers/githubController.js
const GithubIntegration = require('../models/GithubIntegration');
const axios = require('axios');

// Connect GitHub account
exports.connectGithub = async (req, res) => {
  try {
    const { accessToken, githubUsername } = req.body;

    if (!accessToken || !githubUsername) {
      return res.status(400).json({ message: 'Access token and GitHub username are required' });
    }

    // Check if user already has a GitHub integration
    let integration = await GithubIntegration.findOne({ user: req.user.id });

    if (integration) {
      integration.accessToken = accessToken;
      integration.githubUsername = githubUsername;
      integration.isActive = true;
    } else {
      integration = new GithubIntegration({
        user: req.user.id,
        accessToken,
        githubUsername
      });
    }

    await integration.save();

    res.json({ message: 'GitHub account connected successfully', integration });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's GitHub repositories
exports.getRepositories = async (req, res) => {
  try {
    const integration = await GithubIntegration.findOne({ user: req.user.id });

    if (!integration || !integration.isActive) {
      return res.status(404).json({ message: 'GitHub integration not found or inactive' });
    }

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${integration.accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: {
        sort: 'updated',
        direction: 'desc'
      }
    });

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      url: repo.html_url,
      description: repo.description,
      private: repo.private,
      updatedAt: repo.updated_at
    }));

    res.json(repos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching repositories' });
  }
};

// Get repository issues
exports.getIssues = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const integration = await GithubIntegration.findOne({ user: req.user.id });

    if (!integration || !integration.isActive) {
      return res.status(404).json({ message: 'GitHub integration not found or inactive' });
    }

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      headers: {
        Authorization: `token ${integration.accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      },
      params: {
        state: 'all',
        sort: 'updated',
        direction: 'desc'
      }
    });

    const issues = response.data.map(issue => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      state: issue.state,
      url: issue.html_url,
      body: issue.body,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      user: issue.user.login
    }));

    res.json(issues);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching issues' });
  }
};

// Create a new issue
exports.createIssue = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { title, body } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Issue title is required' });
    }

    const integration = await GithubIntegration.findOne({ user: req.user.id });

    if (!integration || !integration.isActive) {
      return res.status(404).json({ message: 'GitHub integration not found or inactive' });
    }

    const response = await axios.post(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      title,
      body: body || ''
    }, {
      headers: {
        Authorization: `token ${integration.accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    res.status(201).json({
      id: response.data.id,
      number: response.data.number,
      title: response.data.title,
      state: response.data.state,
      url: response.data.html_url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating issue' });
  }
};