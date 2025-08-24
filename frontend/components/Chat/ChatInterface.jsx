import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '@/utils/api';
import socketService from '@/utils/socket';
import ChatMessage from './ChatMessage';
import ChatSidebar from './ChatSidebar';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState('general');
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeChat();
    
    return () => {
      // Cleanup socket listeners
      socketService.off('newMessage', handleNewMessage);
      socketService.off('userTyping', handleUserTyping);
      socketService.off('userList', handleUserList);
    };
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages();
    }
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      await fetchCurrentUser();
      await fetchUsers();
      
      // Setup socket listeners
      socketService.on('newMessage', handleNewMessage);
      socketService.on('userTyping', handleUserTyping);
      socketService.on('userList', handleUserList);
      
      // Connect to socket
      socketService.connect();
      
      // Join general room by default
      socketService.joinRoom('general');
      
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError('Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await fetchWithAuth('/auth/me');
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  };

  const fetchMessages = async () => {
    try {
      const url = `/chat/messages?limit=100&room=${activeRoom}`;
      
      const data = await fetchWithAuth(url);
      setMessages(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await fetchWithAuth('/chat/users');
      const usersWithStatus = data.map(user => ({ 
        ...user, 
        isOnline: false,
        // Ensure proper fallbacks
        username: user.username || 'Unknown',
        fullName: user.fullName || user.username || 'Unknown User'
      }));
      setUsers(usersWithStatus);
    } catch (error) {
      console.error('Error fetching chat users:', error);
      setError('Failed to load team members');
      
      // Fallback: Use current user only
      if (currentUser) {
        setUsers([{
          _id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.username,
          isOnline: false
        }]);
      }
    }
  };

  const handleNewMessage = (message) => {
  // Only add the message if it belongs to the current room
  if (message.room === activeRoom) {
    // Check if this is a duplicate of a temporary message we already added
    const isDuplicate = messages.some(msg => 
      msg.isTemp && msg.content === message.content && 
      msg.sender._id === message.sender._id
    );
    
    if (!isDuplicate) {
      setMessages(prev => [...prev, message]);
    }
    
    // Clear typing indicator for this user
    setTypingUsers(prev => prev.filter(u => u.userId !== message.sender._id));
  }
};

  const handleUserTyping = (data) => {
    if (data.isTyping) {
      setTypingUsers(prev => [...prev.filter(u => u.userId !== data.userId), data]);
    } else {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    }
  };

  const handleUserList = (userList) => {
    // Update online status of users
    setUsers(prev => prev.map(user => ({
      ...user,
      isOnline: userList.some(u => u.id === user._id)
    })));
  };

  const sendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim()) return;

  try {
    const messageData = {
      content: newMessage.trim(),
      room: activeRoom
    };

    // Create a temporary message object for immediate UI update
    const tempMessage = {
      _id: Date.now().toString(), // Temporary ID
      content: newMessage.trim(),
      room: activeRoom,
      sender: {
        _id: currentUser.id,
        username: currentUser.username
      },
      timestamp: new Date().toISOString(),
      isTemp: true // Flag to identify temporary messages
    };

    // Immediately add the message to the UI for instant feedback
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    // Send the message to the server
    const response = await fetchWithAuth('/chat/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    // Replace the temporary message with the real one from the server
    setMessages(prev => prev.map(msg => 
      msg.isTemp && msg._id === tempMessage._id 
        ? { ...response, sender: { _id: currentUser.id, username: currentUser.username } }
        : msg
    ));

  } catch (error) {
    console.error('Error sending message:', error);
    setError('Failed to send message');
    
    // Remove the temporary message if there was an error
    setMessages(prev => prev.filter(msg => !msg.isTemp || msg._id !== tempMessage._id));
  }
};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRoomChange = (room) => {
    if (activeRoom) {
      socketService.leaveRoom(activeRoom);
    }
    setActiveRoom(room);
    socketService.joinRoom(room);
    setMessages([]); // Clear messages when changing room
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar
        activeRoom={activeRoom}
        onRoomChange={handleRoomChange}
        users={users}
      />
      
      <div className="flex flex-col flex-1">
        <div className="bg-white p-4 border-b">
          <h2 className="text-xl font-semibold">
            {activeRoom ? `#${activeRoom}` : 'Select a chat'}
          </h2>
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500">
              {typingUsers.map(user => user.username).join(', ')} is typing...
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchUsers();
              }}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Retry
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <i className="bi bi-chat-dots text-4xl mb-4 opacity-50"></i>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message._id} message={message} currentUser={currentUser} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="bg-white p-4 border-t">
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                // Send typing indicator
                socketService.emit('typing', {
                  room: activeRoom,
                  isTyping: e.target.value.length > 0
                });
              }}
              onBlur={() => {
                socketService.emit('typing', {
                  room: activeRoom,
                  isTyping: false
                });
              }}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;