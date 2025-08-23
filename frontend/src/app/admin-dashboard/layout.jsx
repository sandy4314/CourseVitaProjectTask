'use client';
import SideNav from '../../../components/SideNav';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <SideNav />
      <div className="flex-1 bg-gray-100 p-4 overflow-y-auto pb-20 sm:pb-4">
        {children}
      </div>

    </div>
  );
}