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
    <div className="p-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <p className="font-bold text-xl">Employees</p>
        <button onClick={handleAddEmployee} className="mt-2 md:mt-0 px-4 py-2 bg-blue-500 text-white flex items-center gap-2 rounded hover:bg-blue-600 transition">
          <i className="bi bi-person-plus"></i> Add Employee
        </button>
      </div>

      {employees.length === 0 ? (
        <NoEmployeeCard />
      ) : (
        <div className="overflow-x-auto rounded shadow-md">
          <table className="min-w-full bg-white border border-gray-200 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 border-b">EMPLOYEE</th>
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">DOMAIN</th>
                <th className="p-4 border-b">SALARY</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr onClick={()=>router.push(`./employees/${emp._id}`)} key={emp._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-lg font-semibold">
                      <i className="bi bi-person"></i>
                    </div>
                    <div>
                      <p className="font-medium">{emp.username}</p>
                      <p className="text-sm text-gray-500">{emp.fullName}</p>
                    </div>
                  </td>
                  <td className="p-4 border-b">{emp.employeeId}</td>
                  <td className="p-4 border-b">{emp.domain}</td>
                  <td className="p-4 border-b">₹ {emp.salary.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};