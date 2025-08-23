'use client';
import { useRouter } from 'next/navigation';
import { FiLogIn, FiCheckCircle, FiTrendingUp, FiUsers, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Employee Task Flow</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your work tasks and boost team productivity with our intuitive platform
          </p>
        </header>

        {/* Hero Section */}
        <div className="flex flex-col items-center mb-20 text-center">
          <div className="max-w-2xl space-y-8">
            <h2 className="text-3xl font-semibold text-gray-800">Efficient Task Management Made Simple</h2>
            <p className="text-lg text-gray-600">
              Organize, prioritize, and complete your work with clarity and efficiency. 
              Our platform helps you stay on top of your tasks while fostering team collaboration.
            </p>
            <button
              onClick={handleLoginClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg transition duration-300 flex items-center gap-2 mx-auto"
            >
              <FiLogIn className="text-xl" />
              Login to Your Account
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiCheckCircle className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3 text-center">Task Management</h3>
              <p className="text-gray-600 text-center">
                Create, assign, and track tasks with intuitive workflows and clear priorities.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiTrendingUp className="text-indigo-600 text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3 text-center">Progress Tracking</h3>
              <p className="text-gray-600 text-center">
                Visualize your progress with insightful analytics and completion metrics.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiUsers className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3 text-center">Team Collaboration</h3>
              <p className="text-gray-600 text-center">
                Seamlessly work together with comments, mentions, and shared timelines.
              </p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-20 bg-white rounded-xl p-12 shadow-sm">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">About Our Platform</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6 text-lg text-gray-700">
                <p>
                  Employee Task Flow is designed to transform how teams organize and execute their work. 
                  We combine simplicity with powerful features to help you focus on what matters most.
                </p>
               



{/* <p>Our platform adapts to your workflow, whether you&apos;re managing personal tasks</p>

 */}



<span className="text-gray-700">Customizable to fit your team&apos;s unique needs</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Choose Us?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-500 mt-1" />
                  <span className="text-gray-700">Intuitive interface that requires minimal training</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-500 mt-1" />
                  <span className="text-gray-700">Real-time updates and notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-500 mt-1" />
                  <span className="text-gray-700">Secure and reliable platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-500 mt-1" />
                  <span className="text-gray-700">Customizable to fit your team&apos;s unique needs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-semibold mb-6">Ready to transform your workflow?</h2>
          {/* <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who are already working smarter with Employee Task Flow
          </p> */}
          <button
            onClick={handleLoginClick}
            className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition duration-300 flex items-center gap-2 mx-auto"
          >
            Get Started Now <FiArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}