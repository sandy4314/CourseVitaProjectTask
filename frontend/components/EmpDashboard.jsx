import React, { useState, useEffect } from 'react';
import EmpOverView from './EmpOverView';
import EmpSideNav from './EmpSideNav';
import { fetchWithAuth } from '@/utils/api';

const EmpDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [nav, setNav] = useState("new");
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [dailyDescription, setDailyDescription] = useState('');
  const [timeDetails, setTimeDetails] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await fetchWithAuth('/tasks');
        setTasks(data);
        
        const activeTask = data.find(task => 
          task.status === 'active' && 
          task.timeEntries?.some(entry => !entry.endTime)
        );
        
        if (activeTask) {
          const activeEntry = activeTask.timeEntries.find(entry => !entry.endTime);
          const activeBreak = activeEntry?.breaks?.find(b => !b.end);
          
          if (activeBreak) {
            setIsOnBreak(true);
          }
          
          setIsActive(true);
          const startTime = new Date(activeEntry.startTime);
          const now = new Date();
          setTimer(Math.floor((now - startTime) / 1000));
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setMessage({ text: 'Failed to load tasks', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  useEffect(() => {
    let interval = null;
    
    if (isActive && !isOnBreak) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isOnBreak]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const showMessage = (text, type = 'info', duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const updatedTask = await fetchWithAuth(`/tasks/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      setTasks(tasks.map(task =>
        task._id === id ? updatedTask : task
      ));
      
      if (selectedTask && selectedTask._id === id) {
        setSelectedTask(updatedTask);
      }
      showMessage(`Task status updated to ${newStatus}`, 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const startTask = async (taskId) => {
    try {
      const updatedTask = await fetchWithAuth(`/tasks/${taskId}/start`, {
        method: 'POST'
      });
      
      setTasks(tasks.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(updatedTask);
      }
      
      setIsActive(true);
      setTimer(0);
      showMessage('Task started! Timer is running.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const takeBreak = async (taskId) => {
    try {
      await fetchWithAuth(`/tasks/${taskId}/break`, {
        method: 'POST'
      });
      
      setIsOnBreak(true);
      showMessage('Break started. Timer paused.', 'info');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const resumeTask = async (taskId) => {
    try {
      await fetchWithAuth(`/tasks/${taskId}/resume`, {
        method: 'POST'
      });
      
      setIsOnBreak(false);
      showMessage('Break ended. Timer resumed.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const endTaskDay = async (taskId) => {
    try {
      const updatedTask = await fetchWithAuth(`/tasks/${taskId}/endday`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: dailyDescription })
      });
      
      setTasks(tasks.map(task => 
        task._id === taskId ? updatedTask : task
      ));
      
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(updatedTask);
      }
      
      setIsActive(false);
      setIsOnBreak(false);
      setTimer(0);
      setDailyDescription('');
      showMessage('Work day ended. Time logged successfully.', 'success');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const getTaskTimeDetails = async (taskId) => {
    try {
      const details = await fetchWithAuth(`/tasks/${taskId}/time`);
      setTimeDetails(details);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const filteredTasks = tasks.filter(task => task.status === nav);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-800' : 
          message.type === 'success' ? 'bg-green-100 text-green-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="p-4 flex-1">
        <EmpOverView />

        <div className='md:ml-11'>
          {!selectedTask && (
            <div className="flex gap-4 mb-6">
              <button onClick={() => setNav("new")} className="px-3 py-1 bg-blue-500 text-white rounded">New Tasks</button>
              <button onClick={() => setNav("active")} className="px-3 py-1 bg-yellow-500 text-white rounded">Active Tasks</button>
              <button onClick={() => setNav("completed")} className="px-3 py-1 bg-green-500 text-white rounded">Completed Tasks</button>
              <button onClick={() => setNav("failed")} className="px-3 py-1 bg-red-500 text-white rounded">Failed Tasks</button>
            </div>
          )}

          {selectedTask ? (
            <div className="p-6 border rounded shadow-lg bg-white">
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

              {selectedTask.status === "active" && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-mono mb-4 text-center">
                    {formatTime(timer)}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {!isActive ? (
                      <button 
                        onClick={() => startTask(selectedTask._id)}
                        className="bg-green-500 hover:bg-green-600 px-4 py-2 text-white rounded"
                      >
                        Start Task
                      </button>
                    ) : (
                      <>
                        {!isOnBreak ? (
                          <button 
                            onClick={() => takeBreak(selectedTask._id)}
                            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 text-white rounded"
                          >
                            Take Break
                          </button>
                        ) : (
                          <button 
                            onClick={() => resumeTask(selectedTask._id)}
                            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white rounded"
                          >
                            End Break
                          </button>
                        )}
                        <button 
                          onClick={() => endTaskDay(selectedTask._id)}
                          className="bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded"
                        >
                          End Day
                        </button>
                      </>
                    )}
                  </div>

                  {isActive && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Today's Work Summary
                      </label>
                      <textarea
                        value={dailyDescription}
                        onChange={(e) => setDailyDescription(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="3"
                        placeholder="Describe what you accomplished today..."
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedTask.status === "new" && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(selectedTask._id, "active")} 
                    className="bg-green-500 px-3 py-1 text-white rounded"
                  >
                    <i className="bi bi-check2-circle p-2"></i>Accept
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedTask._id, "failed")} 
                    className="bg-red-500 px-3 py-1 text-white rounded"
                  >
                    <i className="bi bi-x-circle p-2"></i>Reject
                  </button>
                </div>
              )}
              
              {selectedTask.status === "active" && !isActive && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateStatus(selectedTask._id, "completed")} 
                    className="bg-green-500 px-3 py-1 text-white rounded"
                  >
                    <i className="bi bi-check2-circle p-2"></i>Mark as Completed
                  </button>
                  <button 
                    onClick={() => updateStatus(selectedTask._id, "failed")} 
                    className="bg-red-500 px-3 py-1 text-white rounded"
                  >
                    <i className="bi bi-x-circle p-2"></i>Mark as Failed
                  </button>
                </div>
              )}

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
                        <span className="font-bold">{Math.floor(timeDetails.totalTimeSpent / 60)}h {timeDetails.totalTimeSpent % 60}m</span>
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
                <p>No tasks in this category.</p>
              ) : (
                filteredTasks.map(task => (
                  <div
                    key={task._id}
                    onClick={() => setSelectedTask({
                      ...task,
                      id: task._id,
                      desc: task.description,
                      duedate: new Date(task.dueDate).toLocaleDateString(),
                      assigneddate: new Date(task.createdAt).toLocaleDateString(),
                      domain: task.category
                    })}
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
      </div>
    </div>
  );
};

export default EmpDashboard;