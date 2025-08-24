// app/admin-dashboard/employee-reports/[id]/page.js
'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';

export default function EmployeeReports() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [report, setReport] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [dateRange, setDateRange] = useState({
    start: getStartOfWeek(new Date()),
    end: getEndOfWeek(new Date())
  });

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

  useEffect(() => {
    fetchEmployeeAndReport();
  }, [id, dateRange]);

  const fetchEmployeeAndReport = async () => {
    try {
      // Fetch employee details
      const employeeData = await fetchWithAuth(`/employees/${id}`);
      setEmployee(employeeData);

      // Fetch weekly report for this employee
      const reportData = await fetchWithAuth(
        `/tasks/weekly-report/${id}?startDate=${dateRange.start}&endDate=${dateRange.end}`
      );
      setReport(reportData);
    } catch (error) {
      showMessage('Failed to load employee report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setDateRange({
      start: getStartOfWeek(selectedDate),
      end: getEndOfWeek(selectedDate)
    });
  };

  const formatTime = (hours) => {
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
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Tasks
          </button>
          <h2 className="text-2xl font-bold">
            Weekly Report for {employee?.fullName}
          </h2>
        </div>
        <input
          type="date"
          value={dateRange.start}
          onChange={handleDateChange}
          className="px-3 py-2 border rounded"
        />
      </div>

      {report ? (
        <>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Employee: {report.employee?.fullName}</p>
                <p className="text-sm text-gray-600">Period: {report.period}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">Total Hours: {formatTime(report.summary.totalHours)}</p>
                <p className="text-sm">Net Hours: {formatTime(report.summary.netHours)}</p>
              </div>
            </div>
          </div>

          {report.dailyReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No time entries found for this period.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {report.dailyReports.map((dayReport, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{dayReport.date}</h3>
                    <div className="text-right">
                      <p className="text-sm font-medium">Worked: {formatTime(dayReport.totalHours)}</p>
                      <p className="text-sm text-gray-600">Breaks: {formatTime(dayReport.totalBreaks)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dayReport.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{task.taskTitle}</h4>
                            <p className="text-sm text-gray-600">{task.taskCategory}</p>
                            {task.description && (
                              <p className="text-sm mt-1">{task.description}</p>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <p>{formatTime(task.hours)}</p>
                            {task.breaks > 0 && (
                              <p className="text-gray-600">Breaks: {formatTime(task.breaks)}</p>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(task.startTime).toLocaleTimeString()} - {new Date(task.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

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
                <p className="text-2xl font-bold">{report.summary.daysWorked}</p>
                <p className="text-sm text-gray-600">Days Worked</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No report data available.</p>
        </div>
      )}
    </div>
  );
}