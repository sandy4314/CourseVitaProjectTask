"use client";
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';

function CreateEmployee() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
  // Style constants - moved inside the component function
  const inputfields = 'border border-gray-300 p-2 rounded-lg w-full';
  const label = 'text-black-600 mb-2';
  const errorstyle = 'mt-1 text-sm text-red-600';

  const validationSchema = Yup.object({
    fullName: Yup.string().required('Full Name is required'),
    username: Yup.string().required('Username is required'),
    domain: Yup.string().required('Employee Domain is required'),
    salary: Yup.number()
      .required('Salary is required')
      .positive('Salary must be a positive number'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    position: Yup.string().required('Position is required'),
    employeeId: Yup.string().required('Employee ID is required'),
    email: Yup.string().required('Email is required'),
  });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      username: '',
      domain: '',
      salary: '',
      password: '',
      position: '',
      employeeId: '',
      email:''
    },
    validationSchema,
    onSubmit: async (values) => {
  setIsSubmitting(true);
  setSubmitError(null);
  
  try {
    // Register user
    await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: values.username,
        password: values.password,
        role: 'employee'
      })
    });

    await fetchWithAuth('/employees', {
        method: 'POST',
        body: JSON.stringify({
          fullName: values.fullName,
          username: values.username,
          domain: values.domain,
          salary: values.salary,
          password: values.password,
          position: values.position,
          employeeId: values.employeeId,
          role: 'employee', // Include role if needed
          email:values.email
        })
      });

     showMessage('Employee created successfully!', 'success');
        setTimeout(() => {
          router.push('/admin-dashboard/employees');
        }, 1500);

  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    setIsSubmitting(false);
  }
},
  });
   const showMessage = (text, type = 'info', duration = 3000) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), duration);
  };

  const domains = [
    'Design',
    'Development',
    'Data Analyst',
    'Marketing',
    'Testing',
    'Support',
    'Project Management',
  ];

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="px-4 py-6 sm:px-8 ">
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
      
      <p className="text-2xl font-semibold mb-4 sm:text-left">Create Employee</p>
      <div className="bg-white p-6 rounded-xl w-full max-w-4xl">
        {submitError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {submitError}
          </div>
        )}


        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className={label} htmlFor='fullName'>Full Name</label>
            <input
              id='fullName'
              name='fullName'
              type='text'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.fullName}
              className={inputfields}
            />
            {formik.touched.fullName && formik.errors.fullName && (
              <p className={errorstyle}>{formik.errors.fullName}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className={label} htmlFor='username'>Username</label>
            <input
              id='username'
              name='username'
              type='text'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
              className={inputfields}
            />
            {formik.touched.username && formik.errors.username && (
              <p className={errorstyle}>{formik.errors.username}</p>
            )}
          </div>
             <div>
            <label className={label} htmlFor='email'>Email</label>
            <input
              id='email'
              name='email'
              type='email'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={inputfields}
            />
            {formik.touched.email && formik.errors.email && (
              <p className={errorstyle}>{formik.errors.email}</p>
            )}
          </div>
          {/* Employee ID */}
          <div>
            <label className={label} htmlFor='employeeId'>Employee ID</label>
            <input
              id='employeeId'
              name='employeeId'
              type='text'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.employeeId}
              className={inputfields}
            />
            {formik.touched.employeeId && formik.errors.employeeId && (
              <p className={errorstyle}>{formik.errors.employeeId}</p>
            )}
          </div>

          {/* Domain */}
          <div>
            <label className={label} htmlFor='domain'>Employee Domain</label>
            <select
              id='domain'
              name='domain'
              value={formik.values.domain}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={inputfields}
            >
              <option value=''>Select Domain</option>
              {domains.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            {formik.touched.domain && formik.errors.domain && (
              <p className={errorstyle}>{formik.errors.domain}</p>
            )}
          </div>

          {/* Position */}
          <div>
            <label className={label} htmlFor='position'>Position</label>
            <input
              id='position'
              name='position'
              type='text'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.position}
              className={inputfields}
            />
            {formik.touched.position && formik.errors.position && (
              <p className={errorstyle}>{formik.errors.position}</p>
            )}
          </div>

          {/* Salary */}
          <div>
            <label className={label} htmlFor='salary'>Salary</label>
            <input
              id='salary'
              name='salary'
              type='number'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.salary}
              className={inputfields}
            />
            {formik.touched.salary && formik.errors.salary && (
              <p className={errorstyle}>{formik.errors.salary}</p>
            )}
          </div>

          {/* Password */}
          <div className="sm:col-span-2">
            <label className={label} htmlFor='password'>Password</label>
            <input
              id='password'
              name='password'
              type='password'
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={inputfields}
            />
            {formik.touched.password && formik.errors.password && (
              <p className={errorstyle}>{formik.errors.password}</p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => formik.resetForm()}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-500 text-black rounded flex gap-2 disabled:opacity-50"
            >
              <i className="bi bi-x"></i> Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded flex gap-2 disabled:bg-blue-300"
            >
              {isSubmitting ? (
                'Creating...'
              ) : (
                <>
                  <i className="bi bi-floppy"></i> Save Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEmployee;