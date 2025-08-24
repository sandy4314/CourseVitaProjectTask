// components/WeeklyReport.js
import React, { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '@/utils/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const WeeklyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [dateRange, setDateRange] = useState({
    start: getStartOfWeek(new Date()),
    end: getEndOfWeek(new Date())
  });
  const [editingEntry, setEditingEntry] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  const reportRef = useRef();

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  function getEndOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() + (7 - day) - (day === 0 ? 7 : 0);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  const showMessage = (text, type = 'info', duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let employeeId;

      // Method 1: Use the new my-profile endpoint
      try {
        const employeeProfile = await fetchWithAuth('/employees/my-profile');
        employeeId = employeeProfile._id;
      } catch (error) {
        console.log('Failed to get employee ID from profile:', error);
        
        // Method 2: Fallback - get employee ID from tasks
        try {
          const tasks = await fetchWithAuth('/tasks');
          if (tasks.length > 0 && tasks[0].assignedTo && tasks[0].assignedTo._id) {
            employeeId = tasks[0].assignedTo._id;
          }
        } catch (taskError) {
          console.log('Failed to get employee ID from tasks:', taskError);
          showMessage('Cannot determine employee ID. Please contact administrator.', 'error');
          return;
        }
      }

      if (!employeeId) {
        showMessage('Cannot determine employee ID. Please contact administrator.', 'error');
        return;
      }

      const data = await fetchWithAuth(
        `/tasks/weekly-report/${employeeId}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      showMessage('Failed to load weekly report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!report) return;
    
    setGeneratingPDF(true);
    try {
      // Create a temporary container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '800px';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.backgroundColor = 'white';
      document.body.appendChild(pdfContainer);
      
      // Generate PDF content
      pdfContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 5px;">Weekly Time Report</h1>
            <p style="color: #6b7280; margin: 0;">${report.period}</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background-color: #f0f9ff; border-radius: 8px;">
            <div>
              <p style="font-weight: bold; margin: 0;">Employee: ${report.employee?.fullName || 'Unknown'}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Week: ${dateRange.start} to ${dateRange.end}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; margin: 0; font-size: 18px;">Total Hours: ${formatTime(report.summary?.totalHours)}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Net Hours: ${formatTime(report.summary?.netHours)}</p>
            </div>
          </div>
          
          ${report.dailyReports && report.dailyReports.length > 0 ? `
            ${report.dailyReports.map(dayReport => `
              <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
                  <h2 style="margin: 0; color: #374151;">${dayReport.date}</h2>
                  <div style="text-align: right;">
                    <p style="margin: 0; font-weight: bold;">Worked: ${formatTime(dayReport.totalHours)}</p>
                    <p style="margin: 5px 0 0 0; color: #6b7280;">Breaks: ${formatTime(dayReport.totalBreaks)}</p>
                  </div>
                </div>
                
                ${dayReport.tasks && dayReport.tasks.length > 0 ? `
                  ${dayReport.tasks.map(task => `
                    <div style="margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #3b82f6;">
                      <div style="display: flex; justify-content: space-between;">
                        <div style="flex: 1;">
                          <h3 style="margin: 0 0 5px 0; color: #1f2937;">${task.taskTitle || 'Unknown Task'}</h3>
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${task.taskCategory || 'No category'}</p>
                          ${task.description ? `<p style="margin: 0 0 8px 0; font-size: 14px;">${task.description}</p>` : ''}
                        </div>
                        <div style="text-align: right;">
                          <p style="margin: 0; font-weight: bold;">${formatTime(task.hours)}</p>
                          ${task.breaks > 0 ? `<p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Breaks: ${formatTime(task.breaks)}</p>` : ''}
                        </div>
                      </div>
                      <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
                        ${task.startTime ? new Date(task.startTime).toLocaleTimeString() : 'N/A'} - ${task.endTime ? new Date(task.endTime).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                  `).join('')}
                ` : '<p style="color: #6b7280; text-align: center;">No tasks recorded</p>'}
              </div>
            `).join('')}
          ` : '<p style="color: #6b7280; text-align: center; padding: 30px;">No time entries found for this period.</p>'}
          
          ${report.summary ? `
            <div style="margin-top: 25px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
              <h2 style="text-align: center; margin-bottom: 15px; color: #374151;">Weekly Summary</h2>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <p style="font-size: 24px; font-weight: bold; margin: 0; color: #3b82f6;">${formatTime(report.summary.totalHours)}</p>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Total Hours</p>
                </div>
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <p style="font-size: 24px; font-weight: bold; margin: 0; color: #ef4444;">${formatTime(report.summary.totalBreaks)}</p>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Total Breaks</p>
                </div>
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <p style="font-size: 24px; font-weight: bold; margin: 0; color: #10b981;">${formatTime(report.summary.netHours)}</p>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Net Hours</p>
                </div>
                <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <p style="font-size: 24px; font-weight: bold; margin: 0; color: #f59e0b;">${report.summary.daysWorked || 0}</p>
                  <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Days Worked</p>
                </div>
              </div>
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      `;

      // Create PDF
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Generate file name
      const fileName = `Weekly_Report_${report.employee?.fullName?.replace(/\s+/g, '_') || 'Employee'}_${dateRange.start}_to_${dateRange.end}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      // Clean up
      document.body.removeChild(pdfContainer);
      
      showMessage('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showMessage('Failed to generate PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditDescription('');
  };

  const startEdit = (task) => {
    console.log('Starting edit for task:', task);
    
    setEditingEntry({
      taskId: task.taskId,
      entryId: task.entryId,
      description: task.description || ''
    });
    setEditDescription(task.description || '');
  };

  const saveEdit = async () => {
    if (!editingEntry) return;

    try {
      const { taskId, entryId } = editingEntry;

      console.log('=== DEBUG: SAVE EDIT START ===');
      console.log('Editing taskId:', taskId);
      console.log('Editing entryId:', entryId);
      console.log('Edit description:', editDescription);

      if (!taskId || !entryId) {
        showMessage('Could not find the time entry to update', 'error');
        return;
      }

      const response = await fetchWithAuth(`/tasks/${taskId}/time-entries/${entryId}/description`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: editDescription })
      });

      console.log('Update response:', response);

      showMessage('Description updated successfully', 'success');
      setEditingEntry(null);
      setEditDescription('');
      
      fetchReport();

    } catch (error) {
      console.error('Error updating description:', error);
      
      if (error.message && error.message.includes('Time entry not found')) {
        showMessage('Time entry not found. Please refresh and try again.', 'error');
      } else if (error.message && error.message.includes('Not authorized')) {
        showMessage('You are not authorized to update this time entry', 'error');
      } else {
        showMessage('Failed to update description', 'error');
      }
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange]);

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setDateRange({
      start: getStartOfWeek(selectedDate),
      end: getEndOfWeek(selectedDate)
    });
  };

  const formatTime = (hours) => {
    if (!hours || isNaN(hours)) return '0h 0m';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-800' : 
          message.type === 'success' ? 'bg-green-100 text-green-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Weekly Time Report</h2>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={handleDateChange}
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={downloadPDF}
            disabled={!report || generatingPDF}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 px-4 py-2 text-white rounded flex items-center"
          >
            {generatingPDF ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2 " fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Download as PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div ref={reportRef}>
        {report ? (
          <>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Employee: {report.employee?.fullName || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Period: {report.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Total Hours: {formatTime(report.summary?.totalHours)}</p>
                  <p className="text-sm">Net Hours: {formatTime(report.summary?.netHours)}</p>
                </div>
              </div>
            </div>

            {report.dailyReports && report.dailyReports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">No time entries found for this period.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {report.dailyReports?.map((dayReport, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{dayReport.date}</h3>
                      <div className="text-right">
                        <p className="text-sm font-medium">Worked: {formatTime(dayReport.totalHours)}</p>
                        <p className="text-sm text-gray-600">Breaks: {formatTime(dayReport.totalBreaks)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {dayReport.tasks?.map((task, taskIndex) => (
                        <div key={taskIndex} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{task.taskTitle || 'Unknown Task'}</h4>
                              <p className="text-sm text-gray-600">{task.taskCategory || 'No category'}</p>
                              
                              {editingEntry && editingEntry.entryId === task.entryId ? (
                                <div className="mt-2">
                                  <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    placeholder="Enter your work description..."
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button
                                      onClick={saveEdit}
                                      className="bg-green-500 hover:bg-green-600 px-3 py-1 text-white rounded text-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="bg-gray-500 hover:bg-gray-600 px-3 py-1 text-white rounded text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {task.description && (
                                    <p className="text-sm mt-1">{task.description}</p>
                                  )}
                                  <button
                                    onClick={() => startEdit(task)}
                                    className="mt-1 text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    {task.description ? 'Edit Description' : 'Add Description'}
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="text-right text-sm ml-4">
                              <p>{formatTime(task.hours)}</p>
                              {task.breaks > 0 && (
                                <p className="text-gray-600">Breaks: {formatTime(task.breaks)}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.startTime ? new Date(task.startTime).toLocaleTimeString() : 'N/A'} - {task.endTime ? new Date(task.endTime).toLocaleTimeString() : 'N/A'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {report.summary && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Weekly Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatTime(report.summary.totalHours)}</p>
                    <p className="text-sm text-gray-600">Total Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatTime(report.summary.totalBreaks)}</p>
                    <p className="text-sm text-gray-600">Total Breaks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{formatTime(report.summary.netHours)}</p>
                    <p className="text-sm text-gray-600">Net Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{report.summary.daysWorked || 0}</p>
                    <p className="text-sm text-gray-600">Days Worked</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No report data available.</p>
            <button
              onClick={fetchReport}
              className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 text-white rounded"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReport;