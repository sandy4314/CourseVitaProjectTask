// app/employee-dashboard/weekly-reports/page.js
'use client';

import WeeklyReport from "../../../../components/WeeklyReport";
import EmpSideNav from "../../../../components/EmpSideNav";

export default function WeeklyReportsPage() {
  return (
    <div className="flex">
      <EmpSideNav />
      <div className="p-4 flex-1">
        <WeeklyReport />
      </div>
    </div>
  );
}