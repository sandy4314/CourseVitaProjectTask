import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../src/utils/api';

const RecentCard = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesData, tasksData] = await Promise.all([
          fetchWithAuth('/employees'),
          fetchWithAuth('/tasks')
        ]);
        
        // Limit to 2 items on the frontend
        setEmployees(employeesData.slice(0, 2));
        setTasks(tasksData.slice(0, 2));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

   if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Employees Card */}
        <div className="w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <i className="bi bi-person text-blue-600 text-xl"></i>
            <p className="text-xl font-semibold text-gray-800 mt-3">Recent Employees</p>
          </div>

          {employees.length === 0 ? (
            <p className="text-gray-500">No employees found.</p>
          ) : (
            <div className="space-y-4">
              {employees.map((emp) => (
                <div
                  key={emp._id}
                  className="flex justify-between items-start border-b pb-3 last:border-none"
                >
                  <div className="text-gray-700">
                    <p className="font-medium text-base">{emp.username}</p>
                    <p className="text-sm text-gray-500">{emp.domain}</p>
                  </div>
                  <div className="text-md bg-blue-100 text-blue-500 mt-1 p-2 rounded">ID: {emp.employeeId}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks Card */}
        <div className="w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <i className="bi bi-clipboard text-blue-600 text-xl"></i>
            <p className="text-xl font-semibold text-gray-800 mt-3">Recent Tasks</p>
          </div>

          {tasks.length === 0 ? (
            <p className="text-gray-500">No tasks found.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="border-b pb-3 last:border-none flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-base text-gray-700">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <div className="text-sm bg-blue-100 text-blue-500 px-3 py-1 rounded">
                    {task.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentCard;