'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  
  useEffect(() => {
    // Check if we're on client side before accessing localStorage
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username') || '');
      setRole(localStorage.getItem('role') || '');
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    router.push('/login');
  };

  // Don't render navbar on login page
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 py-3 shadow-lg">
      <div className="px-5 mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
          <i className="bi bi-person text-white text-xl"></i>
          <span className="text-white text-lg sm:text-xl font-semibold">
            {role === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
          </span>
        </div>
        
        {username && (
          <div className="flex items-center gap-4">
            <p className="text-white text-sm sm:text-base">
              Logged in as <span className="font-semibold">{username}</span>
            </p>
            <span className="text-white bg-indigo-600 px-3 py-1 text-xs sm:text-sm rounded-full capitalize">
              {role}
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 bg-white hover:bg-gray-100 text-blue-600 px-3 py-1 rounded text-sm sm:text-base transition"
            >
              <i className="bi bi-box-arrow-right text-lg"></i>
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;  