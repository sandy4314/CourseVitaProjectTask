'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const EmpSideNav = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { path: '/employee-dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/employee-dashboard/weekly-reports', label: 'Weekly Reports', icon: 'bi-calendar-week' },
    { path: '/employee-dashboard/communication', label: 'Team Chat', icon: 'bi-chat-dots' },
  ];

  return (
    <>
      <div
        className={`hidden md:flex flex-col bg-white h-screen py-6 px-4 transition-all duration-300 ${
          isOpen ? 'w-60' : 'w-16'
        } shadow-2xl shadow-blue-200/60 border-r border-blue-100`}
      >
        <div className={`flex items-center mb-8 ${isOpen ? 'justify-between' : 'justify-center'}`}>
          {isOpen && (
            <p className="text-lg font-semibold whitespace-nowrap bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Employee Portal
            </p>
          )}
          <i
            className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'} cursor-pointer ${
              isOpen ? '' : 'mx-auto'
            } text-gray-600 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50`}
            onClick={() => setIsOpen(!isOpen)}
          ></i>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`no-underline flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === item.path
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold shadow-md shadow-blue-200/50 border-l-4 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:shadow-sm hover:shadow-gray-200'
              } ${isOpen ? 'justify-start' : 'justify-center'}`}
            >
              <i className={`bi ${item.icon} text-lg ${isOpen ? '' : 'mx-auto'} ${
                pathname === item.path ? 'text-blue-600' : 'text-gray-500'
              }`}></i>
              {isOpen && <span className="transition-all duration-200">{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        {/* Decorative element at bottom */}
        {isOpen && (
          <div className="mt-auto text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            <p>Employee Portal v1.0</p>
          </div>
        )}
      </div>

      {/* Bottom nav for small screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl shadow-gray-300/50 border-t border-gray-200 md:hidden flex justify-around py-3 z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`no-underline flex flex-col items-center text-xs transition-all duration-200 ${
              pathname === item.path 
                ? 'text-blue-600 font-semibold scale-110' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              pathname === item.path 
                ? 'bg-blue-100 shadow-inner' 
                : 'hover:bg-gray-100'
            }`}>
              <i className={`bi ${item.icon} text-lg`}></i>
            </div>
            <span className="mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default EmpSideNav;