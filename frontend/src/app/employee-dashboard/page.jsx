'use client';
import EmpDashboard from '../../../components/EmpDashboard';
import EmpSideNav from '../../../components/EmpSideNav';

export default function EmployeeDashboard() {
  return (
    <div className="flex">
      <EmpSideNav />
      <div className="p-4 flex-1">
        <EmpDashboard />
      </div>
    </div>
  );
}