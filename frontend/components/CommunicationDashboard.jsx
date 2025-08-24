import React, { useState, useEffect } from 'react';
import ChatInterface from './Chat/ChatInterface';
import ForumList from './Forum/ForumList';
import GitHubIntegration from './GitHub/GitHubIntegration';
import socketService from '@/utils/socket';

const CommunicationDashboard = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();
    
    socketService.on('connect', () => {
      setIsSocketConnected(true);
    });
    
    socketService.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    return () => {
      socketService.off('connect');
      socketService.off('disconnect');
    };
  }, []);

  const tabs = [
    { id: 'chat', name: 'Team Chat', icon: '💬' },
    { id: 'forum', name: 'Discussion Forum', icon: '📋' },
    { id: 'github', name: 'GitHub Integration', icon: '🐙' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Team Communication</h1>
            <div className="flex items-center">
              {/* <div className={`w-3 h-3 rounded-full mr-2 ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isSocketConnected ? 'Connected' : 'Disconnected'}
              </span> */}
            </div>
          </div>
          
          <div className="flex space-x-8 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'forum' && <ForumList />}
        {activeTab === 'github' && <GitHubIntegration />}
      </div>
    </div>
  );
};

export default CommunicationDashboard;