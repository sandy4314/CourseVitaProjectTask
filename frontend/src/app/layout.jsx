'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../../components/Navbar';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('role');
      
      // Allow access to homepage and login page without auth
      if (pathname === '/' || pathname === '/login') {
        setIsLoading(false);
        return;
      }
      
      if (!username) {
        router.push('/login');
      } else if (username && pathname === '/login') {
        router.push(role === 'admin' ? '/admin-dashboard' : '/employee-dashboard');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <html lang="en">
        <head>
          <title>Employee Task Flow</title>
        </head>
        <body className={inter.className}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Employee Task Flow</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />
      </head>
      <body className={inter.className}>
        {pathname !== '/' && pathname !== '/login' && <Navbar />}
        <main className={pathname === '/' ? '' : 'min-h-[calc(100vh-64px)]'}>
          {children}
        </main>
      </body>
    </html>
  );
}