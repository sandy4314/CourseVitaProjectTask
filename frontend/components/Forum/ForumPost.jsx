import React, { useState } from 'react';
import { fetchWithAuth } from '@/utils/api';

const ForumPost = ({ post, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState(post.replies || []);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const data = await fetchWithAuth(`/forum/posts/${post._id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: replyContent })
      });

      setReplies([...replies, data]);
      setReplyContent('');
      setShowReply(false);
      onUpdate(); // Refresh the post list
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>By {post.author.username}</span>
            <span>{formatDate(post.timestamp)}</span>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
              {post.category}
            </span>
            {post.isPinned && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                Pinned
              </span>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {post.views} views • {replies.length} replies
        </div>
      </div>

      <div className="prose max-w-none mb-4">
        <p>{post.content}</p>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex space-x-4 border-t pt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
        >
          <i className={`bi ${expanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          {expanded ? 'Hide Replies' : `Show Replies (${replies.length})`}
        </button>
        <button
          onClick={() => setShowReply(!showReply)}
          className="text-green-500 hover:text-green-700 text-sm flex items-center gap-1"
        >
          <i className="bi bi-reply"></i>
          Reply
        </button>
      </div>

      {showReply && (
        <form onSubmit={handleReply} className="mt-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows="3"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button
              type="button"
              onClick={() => setShowReply(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!replyContent.trim()}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Post Reply
            </button>
          </div>
        </form>
      )}

      {expanded && replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <div key={reply._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{reply.author.username}</span>
                <span className="text-sm text-gray-500">
                  {formatDate(reply.timestamp)}
                </span>
              </div>
              <p className="text-gray-700">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumPost;