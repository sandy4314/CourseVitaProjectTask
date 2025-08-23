"use client";

import { useEffect, useState,use } from 'react';
import { fetchWithAuth } from './../../../../utils/api';
import { useRouter } from 'next/navigation';

export default function EmployeeTasks({ params }) {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeDetails, setTimeDetails] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  const paramsid=use(params);
  const id = paramsid.id;

  const deleteEmployee = async () => {
   

    try {
      const response = await fetchWithAuth(`/employees/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        showMessage('Employee deleted successfully', 'success');
        setShowDeleteModal(false);
        setTimeout(() => {
          router.push('/admin-dashboard/employees');
        }, 1500);
      }
    } catch (error) {
      showMessage(error.message || 'Failed to delete employee', 'error');
      setShowDeleteModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const showMessage = (text, type = 'info', duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await fetchWithAuth("/tasks");
        const employeeTasks = data.filter(task => task.assignedTo?._id === id);
        setTasks(employeeTasks);
        setFilteredTasks(employeeTasks);
      } catch (err) {
        showMessage("Failed to load tasks", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [id]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === filter));
    }
  }, [filter, tasks]);

  const getTaskTimeDetails = async (taskId) => {
    try {
      const details = await fetchWithAuth(`/tasks/${taskId}/time`);
      setTimeDetails(details);
      setSelectedTask(tasks.find(task => task._id === taskId));
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
       {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={deleteEmployee}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-800' : 
          message.type === 'success' ? 'bg-green-100 text-green-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Assigned Tasks</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative">
              <select 
                onChange={(e) => setFilter(e.target.value)}
                value={filter}
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Tasks</option>
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => router.push(`../update-employee/${id}`)} 
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Update
              </button>
              <button 
            onClick={() => setShowDeleteModal(true)} // Changed to open modal
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>

      {selectedTask ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <button 
            onClick={() => {
              setSelectedTask(null);
              setTimeDetails(null);
            }} 
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Back to Tasks</span>
          </button>
          
          <h2 className="text-2xl font-semibold mb-2">{selectedTask.title}</h2>
          <p className="mb-2 text-gray-700">{selectedTask.description}</p>
          
          <div className="flex gap-5 text-sm mb-4">
            <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTask.status)}`}>
              {selectedTask.status}
            </span></p>
            <p><i className="bi bi-calendar pr-2"></i>{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
            <p><i className="bi bi-tag pr-2"></i>{selectedTask.category}</p>
            <p><i className="bi bi-clock"></i> {new Date(selectedTask.dueDate).toLocaleDateString()}</p>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Time Tracking</h3>
              <button 
                onClick={() => getTaskTimeDetails(selectedTask._id)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Refresh History</span>
              </button>
            </div>
            
            {timeDetails ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Time Spent:</span>
                    <span className="font-bold">{formatDuration(timeDetails.totalTimeSpent || 0)}</span>
                  </div>
                </div>
                
                {timeDetails.timeEntries?.map((entry, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {new Date(entry.startTime).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {new Date(entry.startTime).toLocaleTimeString()} - 
                          {entry.endTime ? ` ${new Date(entry.endTime).toLocaleTimeString()}` : ' Present'}
                        </span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {entry.totalDuration} minutes
                      </span>
                    </div>
                    
                    <div className="p-4">
                      {entry.description && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
                          <p className="text-gray-600">{entry.description}</p>
                        </div>
                      )}
                      
                      {entry.breaks?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Breaks:</h4>
                          <ul className="space-y-2">
                            {entry.breaks.map((breakItem, breakIndex) => (
                              <li key={breakIndex} className="flex justify-between text-sm">
                                <span>
                                  {new Date(breakItem.start).toLocaleTimeString()} - 
                                  {breakItem.end ? ` ${new Date(breakItem.end).toLocaleTimeString()}` : ' Present'}
                                </span>
                                <span className="font-medium">{breakItem.duration} minutes</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2">No time tracking data available</p>
                <button 
                  onClick={() => getTaskTimeDetails(selectedTask._id)}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Load Time Tracking
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {tasks.length === 0 ? 'No tasks assigned' : `No ${filter} tasks`}
              </h3>
              <p className="mt-1 text-gray-500">
                {tasks.length === 0 ? 'This employee doesn\'t have any tasks yet.' : 'Try selecting a different filter.'}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task._id}
                onClick={() => getTaskTimeDetails(task._id)}
                className="p-4 border rounded shadow cursor-pointer hover:bg-gray-100 h-full flex flex-col"
              >
                <div className="flex justify-between items-start mb-2 min-h-[3rem]">
                  <h2 className="text-lg font-semibold line-clamp-2 flex-1 pr-2">
                    {task.title}
                  </h2>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)} whitespace-nowrap h-fit`}>
                    {task.status || '-'}
                  </span>
                </div>
                <p className="mb-2 text-gray-700 line-clamp-2">
                  {task.description ? (task.description.length > 60 ? task.description.slice(0, 60) + "..." : task.description) : "No description"}
                </p>
                <div className="text-sm text-gray-600 mt-auto">
                  <p><i className="bi bi-calendar pr-2"></i>{new Date(task.createdAt).toLocaleDateString() || "Not assigned"}</p>
                  <p><i className="bi bi-tag pr-2"></i>{task.category || "No category"}</p>
                  <p><i className="bi bi-clock"></i> {new Date(task.dueDate).toLocaleDateString() || "No due date"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}