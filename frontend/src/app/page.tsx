'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogIn, FiCheckCircle, FiTrendingUp, FiUsers, FiArrowRight, FiMenu, FiX, FiGithub, FiTwitter, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Home() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    // Initialize scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const handleLoginClick = () => {
    router.push('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 scroll-smooth">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .opacity-0 {
          opacity: 0;
        }
        section {
          opacity: 0;
        }
      `}</style>

      {/* Navbar with fixed height */}
      <nav className={`bg-white fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''} h-18`}>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between relative">

          {/* Left: Logo */}
          <h1
            onClick={() => router.push('/')}
            className="text-2xl font-bold text-blue-600 cursor-pointer flex-shrink-0"
          >
            CollabSphere
          </h1>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 gap-8 text-gray-700 font-medium">
            <button onClick={() => scrollToSection('#features')} className="relative group text-gray-700 hover:text-blue-600 transition-colors duration-300">
              Features
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('#about')} className="relative group text-gray-700 hover:text-blue-600 transition-colors duration-300">
              About
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('#contact')} className="relative group text-gray-700 hover:text-blue-600 transition-colors duration-300">
              Contact
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </div>

          {/* Right: Login + Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLoginClick}
              className="hidden md:flex bg-blue-600 text-white font-medium py-2 px-5 rounded-lg items-center gap-2 transition transform hover:scale-105 hover:bg-blue-700 hover:shadow-lg duration-300"
            >
              <FiLogIn /> Login
            </button>

            {/* Hamburger for mobile */}
            <button className="md:hidden text-2xl text-gray-700 z-60" onClick={toggleMenu}>
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setMenuOpen(false)}
          />

          {/* Mobile Menu */}
          <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col gap-6 p-8 pt-20">
              <button 
                onClick={() => scrollToSection('#features')} 
                className="text-left text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300 py-2 border-b border-gray-100"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('#about')} 
                className="text-left text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300 py-2 border-b border-gray-100"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('#contact')} 
                className="text-left text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-300 py-2 border-b border-gray-100"
              >
                Contact
              </button>
              <button
                onClick={() => { handleLoginClick(); setMenuOpen(false); }}
                className="bg-blue-600 text-white font-medium py-3 px-5 rounded-lg flex items-center gap-2 transition transform hover:scale-105 hover:bg-blue-700 mt-4"
              >
                <FiLogIn /> Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content with adjusted padding for fixed navbar */}
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

        {/* Hero Section with Background Video */}
        <section className="flex flex-col items-center mb-20 text-center rounded-xl shadow-md overflow-hidden relative">
          {/* Background Video */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/bg2.mp4"
            autoPlay
            loop
            muted
            playsInline
          ></video>

          {/* Dark Overlay (makes text visible) */}
          <div className="absolute inset-0 bg-opacity-40"></div>

          {/* Content */}
          <div className="relative max-w-2xl space-y-10 py-20 px-6 text-white">
            <h2 className="text-3xl md:text-4xl font-semibold drop-shadow-[0_0_10px_rgba(0,0,0,0.7)]">
              Stay Organized. Stay Connected. Deliver Better.
            </h2>

            <p className="text-lg md:text-xl drop-shadow-[0_0_10px_rgba(0,0,0,0.7)]">
              Assign tasks with deadlines, track progress in real-time, and communicate effectively with your team.
              CollabSphere brings everything into one powerful dashboard.
            </p>

            <button
              onClick={handleLoginClick}
              className="relative overflow-hidden bg-blue-600 text-white font-medium py-3 px-8 rounded-lg text-lg flex items-center gap-2 mx-auto shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-400 before:via-blue-500 before:to-indigo-500 before:opacity-30 before:translate-x-full before:transition-transform before:duration-500 hover:before:translate-x-0"
            >
              <FiLogIn className="text-xl" />
              Get Started
            </button>
          </div>
        </section>

        <div className="flex justify-center gap-3 py-8">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-300"></div>
        </div>

        <section id="features" className="mb-20 scroll-mt-28">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mt-32 mb-16">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[350px] flex flex-col justify-between transform hover:-translate-y-1">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiCheckCircle className="text-blue-600 text-4xl" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800 mb-4 text-center">Task Management</h3>
              <p className="text-lg text-center">
                Assign tasks with deadlines, set priorities, and update statuses in real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[350px] flex flex-col justify-between transform hover:-translate-y-1">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiTrendingUp className="text-indigo-600 text-4xl" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800 mb-4 text-center">Progress Tracking</h3>
              <p className="text-lg text-center">
                Monitor task completion, view progress charts, and receive instant feedback.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 min-h-[350px] flex flex-col justify-between transform hover:-translate-y-1">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FiUsers className="text-purple-600 text-4xl" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800 mb-4 text-center">Team Communication</h3>
              <p className="text-lg text-center">
                Built-in chat, discussion forums, and GitHub integration for smooth collaboration.
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-center gap-3 py-8">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-300"></div>
        </div>

        {/* About Section */}
        <section
          id="about"
          className="mt-36 mb-20 bg-white rounded-xl p-8 md:p-12 shadow-sm scroll-mt-28"
        >
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
            About CollabSphere
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <div className="space-y-6 text-lg text-gray-700">
                <p>
                  CollabSphere is built to help teams like Aaravs stay focused and
                  efficient. From assigning tasks to generating weekly reports,
                  everything is integrated in one place.
                </p>
                <span className="text-gray-700">
                  Real-time updates, customizable workflows, and external tool
                  integrations.
                </span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-6 md:p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Why Choose Us?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Auto-generate and edit weekly reports
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Seamless integration with GitHub and external tools
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Real-time collaboration and feedback system
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FiCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">
                    Secure and scalable MERN stack backend
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="flex justify-center gap-3 py-8">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-300"></div>
        </div>

        {/* Contact Section - Simplified without form */}
        <section
          id="contact"
          className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 md:p-12 text-white scroll-mt-28 mt-24"
        >
          <h2 className="text-3xl font-semibold mb-6">
            Ready to boost your teams productivity?
          </h2>
          <p className="mb-6 text-lg">
            Get in touch with us to learn more about how CollabSphere can transform your teams workflow.
          </p>
          <button
            onClick={handleLoginClick}
            className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-3 px-8 rounded-lg text-lg transition duration-300 flex items-center gap-2 justify-center mx-auto transform hover:scale-105"
          >
            Get Started <FiArrowRight />
          </button>
        </section>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-blue-400">CollabSphere</h3>
              <p className="text-gray-400">
                Empowering teams to collaborate efficiently and deliver exceptional results.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <FiTwitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <FiLinkedin className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  <FiGithub className="text-xl" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => scrollToSection('#features')}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('#about')}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('#contact')}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button 
                    onClick={handleLoginClick}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  >
                    Login
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">API Reference</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Support</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <FiMail className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">contact@collabsphere.com</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FiPhone className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start space-x-3">
                  <FiMapPin className="text-blue-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">Andhra Pradesh, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-8"></div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} CollabSphere. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-400 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}