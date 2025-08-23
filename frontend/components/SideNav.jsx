'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const SideNav = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    
    { path: '/admin-dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/admin-dashboard/employees', label: 'Employees', icon: 'bi-people' },
    { path: '/admin-dashboard/create-employee', label: 'Create Employees', icon: 'bi-person-plus' },
    { path: '/admin-dashboard/assign-task', label: 'Assign Task', icon: 'bi-list-task' },

  ];

  return (
    <>
      <div
        className={`hidden md:flex flex-col bg-white border-r shadow-md h-screen py-6 px-4 transition-all duration-300 ${
          isOpen ? 'w-60' : 'w-16'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          {isOpen && <p className="text-lg font-semibold whitespace-nowrap">Admin Panel</p>}
          <i
            className={`bi ${isOpen ? 'bi-chevron-left' : 'bi-chevron-right'} cursor-pointer`}
            onClick={() => setIsOpen(!isOpen)}
          ></i>
        </div>
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`no-underline flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === item.path
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <i className={`bi ${item.icon} text-lg`}></i>
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom nav for small screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t md:hidden flex justify-around py-2 z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`no-underline flex flex-col items-center text-xs ${
              pathname === item.path ? 'text-blue-600 font-semibold' : 'text-gray-500'
            }`}
          >
            <i className={`bi ${item.icon} text-lg`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default SideNav;       