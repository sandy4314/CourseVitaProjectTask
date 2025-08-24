import React from 'react';

const ChatMessage = ({ message, currentUser, isTemporary = false }) => {
  const isOwnMessage = currentUser && message.sender._id === currentUser.id;
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-blue-500 text-white rounded-br-none' 
          : 'bg-white border border-gray-200 rounded-bl-none'
      } ${isTemporary ? 'opacity-70' : ''}`}>
        <div className="flex items-center space-x-2 mb-1">
          {!isOwnMessage && (
            <span className="font-semibold text-sm text-gray-800">
              {message.sender.username}
            </span>
          )}
          <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
            {timestamp}
          </span>
          {isTemporary && (
            <span className="text-xs text-gray-400">Sending...</span>
          )}
        </div>
        <p className="break-words text-sm">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;