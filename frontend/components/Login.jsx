// import {React,useState} from 'react';
// import { Formik, Form, Field,ErrorMessage } from 'formik';
// import * as Yup from 'yup';
// import axios from '../api';
// import { useNavigate } from 'react-router-dom';
// const Login = () => {
//   const [showPassword, setShowPassword] = useState(false);

//   const navigate=useNavigate();

//   const Loginvalidation=Yup.object().shape({
//     username: Yup.string().required("Username is required"),
//     password:Yup.string().required('Password is required')
//   });
  
//   const handlesubmit = async (values) => {
//   const { username, password } = values;
//   try {
//     const res = await axios.post('/auth/login', { username, password });
//     const { token, user } = res.data;
//     const role = user.role;

//     localStorage.setItem("token", token);
//     localStorage.setItem("role", role);

//     if (role === "admin") {
//       navigate('/admin-dashboard');
//     } else if (role === "employee") {
//       navigate('/employee-dashboard');
//     } else {
//       navigate('/');
//     }
//   } catch (err) {
//     alert(err.response?.data?.msg || "Login failed");
//   }
// };

//   return ( 
//     <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-100 via-red-200 to-blue-300">

//       <Formik
//         initialValues={{ username: '', password: '' }} validationSchema={Loginvalidation}
//         onSubmit={(values) => { 
//           handlesubmit(values);
//         }}
//       >
//         {() => (
//           <Form className="bg-white p-7 border border-blue-300  shadow-2xl shadow-pink-500 rounded-xl space-y-4 w-[450px]">
//             <div>
//               <p className="text-gray-400">Username</p>
//               <Field
//                 name="username"
//                 type="text"
//                 className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
//               />
//               <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
//             </div>

//             <div>
//               <div className='flex justify-between'>

//               <p className="text-gray-400">Password</p>
//               <button type="button" onClick={() => setShowPassword((prev) => !prev)} className=" text-sm text-gray-500">
//               {showPassword ? <i className="bi bi-eye-slash text-gray-400 text-2xl"></i>:<i className="bi bi-eye text-2xl"></i> }
//               </button></div>
//               <Field
//                 name="password"
//                 type={showPassword ? 'text' : 'password'}
//                 className="w-full px-4 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
//               />
              
//               <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />

//             </div>

//             <p className="text-sm text-blue-600 cursor-pointer hover:underline text-right">
//               Forgot your password?
//             </p>

//             <button
//               type="submit"
//               className="mt-5 rounded-3xl cursor-pointer bg-green-300 h-10 w-full focus:ring-2 focus:ring-green-200"
//             >
//               Login
//             </button>

//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default Login;
