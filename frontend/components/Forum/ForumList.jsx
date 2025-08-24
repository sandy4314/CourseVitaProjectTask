import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/utils/api';
import ForumPost from './ForumPost';
import NewPostModal from './NewPostModal';

const ForumList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchPosts();
  }, [currentPage, category, search]);

  const showMessage = (text, type = 'info', duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(category !== 'all' && { category }),
        ...(search && { search })
      });

      const data = await fetchWithAuth(`/forum/posts?${params}`);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      showMessage('Failed to load forum posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = () => {
    setShowNewPostModal(true);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowNewPostModal(false);
    showMessage('Post created successfully!', 'success');
  };

  const categories = ['all', 'general', 'projects', 'help', 'ideas', 'announcements'];

  return (
    <div className="max-w-4xl mx-auto p-6">
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
        <h1 className="text-2xl font-bold">Team Forum</h1>
        <button
          onClick={handleNewPost}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <i className="bi bi-plus-circle"></i>
          New Post
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
          <i className="bi bi-chat-square-text text-4xl mb-4"></i>
          <p className="text-lg mb-2">
            {search ? 'No posts match your search.' : 'No posts yet.'}
          </p>
          <p className="text-sm">
            {search ? 'Try a different search term' : 'Be the first to start a discussion!'}
          </p>
          {!search && (
            <button
              onClick={handleNewPost}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Create First Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <ForumPost key={post._id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showNewPostModal && (
        <NewPostModal
          onClose={() => setShowNewPostModal(false)}
          onPostCreated={handlePostCreated}
          categories={categories.filter(cat => cat !== 'all')}
        />
      )}
    </div>
  );
};

export default ForumList;