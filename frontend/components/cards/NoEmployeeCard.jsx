"use client"; // Required since you're using hooks and interactivity
import React from 'react';
import { useRouter } from 'next/navigation'; // Correct import for Next.js 13+

const NoEmployeeCard = () => {
  const router = useRouter(); // Fixed: useRouter instead of useNavigate

  const handleAddEmployee = () => {
    router.push('./create-employee'); // Using router.push() instead of navigate
  };

  return (
    <div className='m-3 flex flex-col items-center bg-white p-5 rounded-md'>
      <i className="bi bi-person text-gray-600 text-2xl"></i>
      <p className='font-bold'>No employees found</p>
      <p className='text-gray-400'>Get started by creating a new employee</p>
      <button
        onClick={handleAddEmployee}
        className='p-2 py-2 bg-blue-500 text-white flex gap-2 rounded'
      >
        <i className="bi bi-person-plus"></i>Add Employee
      </button>
    </div>
  );
};

export default NoEmployeeCard;