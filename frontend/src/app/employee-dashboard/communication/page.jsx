'use client';
import CommunicationDashboard from '../../../../components/CommunicationDashboard';
import EmpSideNav from '../../../../components/EmpSideNav';

export default function CommunicationPage() {
  return (
    <div className="flex">
      <EmpSideNav />
      <div className="p-4 flex-1">
        <CommunicationDashboard />
      </div>
    </div>
  );
}