import React from 'react';

const ChatSidebar = ({ activeRoom, onRoomChange, users, connectionStatus }) => {
  const rooms = ['general', 'projects', 'random', 'support', 'announcements'];

  return (
    <div className="w-64 bg-white border-r h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg text-gray-800">Chat Rooms</h3>
        <div className="flex items-center mt-1 text-sm">
          {/* <div className={`w-2 h-2 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div> 
           <span className="text-gray-500 text-xs">
            {connectionStatus === 'connected' ? 'Online' : 'Offline'}
          </span> */}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">Public Rooms</h4>
          <ul className="space-y-1">
            {rooms.map((room) => (
              <li key={room}>
                <button
                  onClick={() => onRoomChange(room)}
                  className={`w-full text-left px-3 py-2 rounded flex items-center space-x-2 transition-colors ${
                    activeRoom === room 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-gray-400">#</span>
                  <span className="flex-1">{room}</span>
                  {activeRoom === room && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t">
          <h4 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">Online Team Members</h4>
          <ul className="space-y-1">
            {users.filter(user => user.isOnline).map((user) => (
              <li key={user._id}>
                <div className="w-full px-3 py-2 rounded flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{user.username}</div>
                    <div className="text-xs text-gray-500 truncate">{user.fullName}</div>
                  </div>
                </div>
              </li>
            ))}
            
            {users.filter(user => user.isOnline).length === 0 && (
              <li className="text-center text-gray-500 text-sm py-2">
                No one online
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Online: {users.filter(u => u.isOnline).length}</span>
          <span>Total: {users.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;