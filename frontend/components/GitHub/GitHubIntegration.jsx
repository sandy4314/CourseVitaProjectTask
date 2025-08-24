import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/utils/api';

const GitHubIntegration = () => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [showConnect, setShowConnect] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [newIssue, setNewIssue] = useState({ show: false, title: '', body: '' });

  useEffect(() => {
    checkConnection();
  }, []);

  const showMessage = (text, type = 'info', duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const checkConnection = async () => {
    try {
      const data = await fetchWithAuth('/github/repos');
      setRepos(data);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const connectGithub = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetchWithAuth('/github/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, githubUsername })
      });

      setIsConnected(true);
      setShowConnect(false);
      setAccessToken('');
      setGithubUsername('');
      checkConnection();
      showMessage('GitHub account connected successfully!', 'success');
    } catch (error) {
      console.error('Error connecting GitHub:', error);
      showMessage(error.message || 'Failed to connect GitHub account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchIssues = async (repo) => {
    try {
      setSelectedRepo(repo);
      const data = await fetchWithAuth(`/github/repos/${repo.owner}/${repo.name}/issues`);
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      showMessage('Failed to fetch issues', 'error');
    }
  };

  const createIssue = async () => {
    if (!newIssue.title.trim()) {
      showMessage('Issue title is required', 'error');
      return;
    }

    try {
      await fetchWithAuth(`/github/repos/${selectedRepo.owner}/${selectedRepo.name}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: newIssue.title, 
          body: newIssue.body 
        })
      });

      setNewIssue({ show: false, title: '', body: '' });
      fetchIssues(selectedRepo);
      showMessage('Issue created successfully!', 'success');
    } catch (error) {
      console.error('Error creating issue:', error);
      showMessage(error.message || 'Failed to create issue', 'error');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect GitHub</h2>
          <p className="text-gray-600 mb-6">
            Connect your GitHub account to sync repositories and issues with your tasks.
          </p>
          <button
            onClick={() => setShowConnect(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center gap-2 mx-auto"
          >
            <i className="bi bi-github"></i>
            Connect GitHub Account
          </button>

          {showConnect && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-4">Connect GitHub</h3>
                <form onSubmit={connectGithub}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GitHub Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Create a token with repo scope in your GitHub settings
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowConnect(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                    >
                      {loading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-800' : 
          message.type === 'success' ? 'bg-green-100 text-green-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">GitHub Integration</h1>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Repositories</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {repos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => fetchIssues(repo)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    selectedRepo?.id === repo.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{repo.name}</div>
                  <div className="text-sm text-gray-500">{repo.owner}</div>
                  {repo.description && (
                    <div className="text-sm text-gray-600 mt-1 truncate">
                      {repo.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedRepo ? (
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  Issues for {selectedRepo.owner}/{selectedRepo.name}
                </h2>
                <button
                  onClick={() => setNewIssue({ show: true, title: '', body: '' })}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 flex items-center gap-1"
                >
                  <i className="bi bi-plus"></i>
                  New Issue
                </button>
              </div>

              {issues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="bi bi-inbox text-4xl mb-4"></i>
                  <p>No issues found in this repository.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div key={issue.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a
                            href={issue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            #{issue.number} {issue.title}
                          </a>
                          <div className="flex items-center space-x-2 mt-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                issue.state === 'open'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {issue.state}
                            </span>
                            <span className="text-sm text-gray-500">
                              by {issue.user}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(issue.updatedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a Repository</h3>
              <p className="text-gray-600">
                Choose a repository from the list to view and manage issues.
              </p>
            </div>
          )}
        </div>
      </div>

      {newIssue.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Issue</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter issue title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newIssue.body}
                  onChange={(e) => setNewIssue({...newIssue, body: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter issue description (optional)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setNewIssue({ show: false, title: '', body: '' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={createIssue}
                  disabled={!newIssue.title.trim()}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitHubIntegration;