'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import NoEmployeeCard from './cards/NoEmployeeCard';
import { fetchWithAuth } from '@/utils/api';

export default function AdminEmp(){
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prevent background scrolling
    document.body.classList.add('overflow-hidden', 'h-full');
    
    const fetchEmployees = async () => {
      try {
        const data = await fetchWithAuth('/employees');
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.classList.remove('overflow-hidden', 'h-full');
    };
  }, []);

  const handleAddEmployee = () => {
    router.push('/admin-dashboard/create-employee'); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <p className="font-bold text-2xl text-gray-800">Employees</p>
        <button 
          onClick={handleAddEmployee} 
          className="relative mt-2 md:mt-0 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 overflow-hidden group"
        >
          {/* Animated background elements */}
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

          {/* Shine effect on hover */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></span>

          {/* Button content */}
          <span className="relative flex items-center gap-2">
            <i className="bi bi-person-plus text-lg"></i>
            <span className="group-hover:scale-105 transition-transform duration-300">Add Employee</span>
            
            {/* Right arrow that appears on hover */}
            <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </span>
        </button>
      </div>

      {employees.length === 0 ? (
        <NoEmployeeCard />
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full bg-white text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-700">EMPLOYEE</th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-700">ID</th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-700">DOMAIN</th>
                <th className="p-4 border-b border-gray-200 font-semibold text-gray-700">SALARY</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr 
                  onClick={() => router.push(`./employees/${emp._id}`)} 
                  key={emp._id} 
                  className="hover:bg-blue-50 transition-all duration-200 cursor-pointer even:bg-gray-50"
                >
                  <td className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 text-blue-800 flex items-center justify-center text-lg font-semibold">
                      <i className="bi bi-person"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{emp.username}</p>
                      <p className="text-sm text-gray-500">{emp.fullName}</p>
                    </div>
                  </td>
                  <td className="p-4 border-b border-gray-100 text-gray-700">{emp.employeeId}</td>
                  <td className="p-4 border-b border-gray-100">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {emp.domain}
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-100 font-semibold text-green-700">₹ {emp.salary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};