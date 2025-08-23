"use client";
import React, { useState, useEffect,use } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/api';

function UpdateEmployee({ params }) {
  
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const paramsid=use(params);
  const id = paramsid.id;

  // Style constants
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
      .min(8, 'Password must be at least 8 characters'),
    position: Yup.string().required('Position is required'),
    employeeId: Yup.string().required('Employee ID is required'),
    email: Yup.string().required('Email is required').email('Invalid email format'),
  });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      username: '',
      domain: '',
      salary: '',
      password: '', // Password is optional for update
      position: '',
      employeeId: '',
      email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        await fetchWithAuth(`/employees/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            fullName: values.fullName,
            username: values.username,
            domain: values.domain,
            salary: values.salary,
            position: values.position,
            employeeId: values.employeeId,
            email: values.email,
            ...(values.password && { password: values.password }) // Only include password if it's provided
          })
        });

        router.push('/admin-dashboard/employees');
      } catch (error) {
        setSubmitError(error.message || 'Failed to update employee');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Fetch employee data when component mounts
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const employeeData = await fetchWithAuth(`/employees/${id}`);
       
        
        formik.setValues({
          fullName: employeeData.fullName || '',
          username: employeeData.username || '',
          domain: employeeData.domain || '',
          salary: employeeData.salary || '',
          password: employeeData.password || '',
          position: employeeData.position || '',
          employeeId: employeeData.employeeId || '',
          email: employeeData.email || ''
        });
      } catch (error) {
        setSubmitError(error.message || 'Failed to load employee data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

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

   if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-8">
      <p className="text-2xl font-semibold mb-4 sm:text-left">Update Employee</p>
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
              disabled
            />
            {formik.touched.username && formik.errors.username && (
              <p className={errorstyle}>{formik.errors.username}</p>
            )}
          </div>
          
          {/* Email */}
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
            <label className={label} htmlFor='domain'> Domain</label>
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
          
              disabled
            />
            {formik.touched.password && formik.errors.password && (
              <p className={errorstyle}>{formik.errors.password}</p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
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
                'Updating...'
              ) : (
                <>
                  <i className="bi bi-floppy"></i> Update Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateEmployee;