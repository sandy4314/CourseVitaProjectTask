"use client";
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import NoEmployeeCard from './cards/NoEmployeeCard';
import { fetchWithAuth } from '@/utils/api';

function AssignTask() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await fetchWithAuth('/employees');
        setEmployees(data.map(emp => emp.username));
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  const validationSchema = Yup.object({
    assignedTo: Yup.string().required('Selecting Employee is required'),
    title: Yup.string()
      .required('Task title is required')
      .min(5, 'Task title must be at least 5 characters')
      .max(100, 'Task title cannot exceed 100 characters'),
    category: Yup.string().required('Category is required'),
    dueDate: Yup.date()
      .required('Due date is required')
      .min(new Date(new Date().setHours(0, 0, 0, 0)), 'Due date cannot be in the past'),
    description: Yup.string()
      .required('Description is required')
      .min(20, 'Description should be at least 20 characters')
      .max(500, 'Description cannot exceed 500 characters'),
  });

  const formik = useFormik({
    initialValues: {
      assignedTo: '',
      title: '',
      category: '',
      dueDate: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await fetchWithAuth('/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values)
        });
        showMessage('Task assigned successfully!', 'success');
        formik.resetForm();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    },
  });
    const showMessage = (text, type = 'info', duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const inputfields = 'border border-gray-300 p-2 rounded-lg w-full';
  const label = 'text-gray-800 mb-2 font-semibold block';
  const errorstyle = 'mt-1 text-sm text-red-600';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded relative">
      {message.text && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-800' : 
          message.type === 'success' ? 'bg-green-100 text-green-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' && (
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {message.type === 'error' && (
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}
      <p className="text-2xl font-semibold mb-6">Assign New Task</p>

      {employees.length === 0 ? (
        <NoEmployeeCard />
      ) : (
        <div className="bg-white p-6 rounded-xl w-full max-w-4xl">
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Assign To */}
            <div>
              <label className={label} htmlFor="assignedTo">Assign To</label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formik.values.assignedTo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={inputfields}
              >
                <option value="">Select Employee</option>
                {employees.map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </select>
              {formik.touched.assignedTo && formik.errors.assignedTo && (
                <p className={errorstyle}>{formik.errors.assignedTo}</p>
              )}
            </div>

            {/* Task Title */}
            <div>
              <label className={label} htmlFor="title">Task Title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Enter Task Title"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
                className={inputfields}
              />
              {formik.touched.title && formik.errors.title && (
                <p className={errorstyle}>{formik.errors.title}</p>
              )}
            </div>

            {/* Category & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={label} htmlFor="category">Category</label>
                <select
  id="category"
  name="category"
  value={formik.values.category}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  className={inputfields}
>
  <option value="">Select Task Category</option>
  
  {/* Design Domain */}
  <optgroup label="Design">
    <option value="UI/UX Design">UI/UX Design</option>
    <option value="Graphic Design">Graphic Design</option>
    <option value="Product Design">Product Design</option>
    <option value="Motion Graphics">Motion Graphics</option>
  </optgroup>
  
  {/* Development Domain */}
  <optgroup label="Development">
    <option value="Frontend Development">Frontend Development</option>
    <option value="Backend Development">Backend Development</option>
    <option value="Mobile Development">Mobile Development</option>
    <option value="DevOps">DevOps</option>
    <option value="Database Management">Database Management</option>
  </optgroup>
  
  {/* Data Domain */}
  <optgroup label="Data">
    <option value="Data Analysis">Data Analysis</option>
    <option value="Data Engineering">Data Engineering</option>
    <option value="Business Intelligence">Business Intelligence</option>
    <option value="Machine Learning">Machine Learning</option>
  </optgroup>
  
  {/* Marketing Domain */}
  <optgroup label="Marketing">
    <option value="Digital Marketing">Digital Marketing</option>
    <option value="Content Marketing">Content Marketing</option>
    <option value="SEO/SEM">SEO/SEM</option>
    <option value="Social Media">Social Media</option>
  </optgroup>
  
  {/* Quality Assurance */}
  <optgroup label="Quality Assurance">
    <option value="Manual Testing">Manual Testing</option>
    <option value="Automated Testing">Automated Testing</option>
    <option value="QA Engineering">QA Engineering</option>
  </optgroup>
  
  {/* Support Domain */}
  <optgroup label="Support">
    <option value="Technical Support">Technical Support</option>
    <option value="Customer Success">Customer Success</option>
    <option value="IT Helpdesk">IT Helpdesk</option>
  </optgroup>
  
  {/* Project Management */}
  <optgroup label="Project Management">
    <option value="Agile Coordination">Agile Coordination</option>
    <option value="Scrum Master">Scrum Master</option>
    <option value="Product Management">Product Management</option>
  </optgroup>
  
  {/* General Categories */}
  <optgroup label="General">
    <option value="Documentation">Documentation</option>
    <option value="Training">Training</option>
    <option value="Research">Research</option>
    <option value="Meeting">Meeting</option>
  </optgroup>
</select>
                {formik.touched.category && formik.errors.category && (
                  <p className={errorstyle}>{formik.errors.category}</p>
                )}
              </div>

              <div>
                <label className={label} htmlFor="dueDate">Due Date</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.dueDate}
                  className={inputfields}
                  min={new Date().toISOString().split('T')[0]}
                />
                {formik.touched.dueDate && formik.errors.dueDate && (
                  <p className={errorstyle}>{formik.errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={label} htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Enter Task Description"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
                className={`${inputfields} resize-none`}
              />
              {formik.touched.description && formik.errors.description && (
                <p className={errorstyle}>{formik.errors.description}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-500 text-black rounded flex gap-2 hover:bg-gray-100"
                onClick={() => formik.resetForm()}
              >
                <i className="bi bi-x"></i> Cancel
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded flex gap-2 hover:bg-blue-600 disabled:bg-blue-300"
              >
                {formik.isSubmitting ? (
                  'Assigning...'
                ) : (
                  <>
                    <i className="bi bi-floppy"></i> Assign Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AssignTask;