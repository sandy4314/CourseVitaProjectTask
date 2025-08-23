import React, { useEffect, useState } from 'react';
import OverviewCard from './cards/OverviewCard';
import { fetchWithAuth } from '@/utils/api';

const EmpOverView = () => {
  const [stats, setStats] = useState({
    new: 0,
    active: 0,
    completed: 0,
    failed: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await fetchWithAuth('/tasks/status');
        setStats(data);
      } catch (error) {
        console.error('Error fetching task stats:', error);
      }
    };
    
    fetchStats();
  }, []);

  const data = [
    {
      title: 'New Tasks',
      count: stats.new.toString(),
      icon: 'bi bi-plus-circle',
      iconcolor: 'text-blue-500',
      iconbg: 'bg-blue-300',
      color: 'bg-blue-100',
    },
    {
      title: 'Active Tasks',
      count: stats.active.toString(),
      icon: 'bi bi-lightning-charge-fill',
      iconcolor: 'text-yellow-600',
      iconbg: 'bg-yellow-300',
      color: 'bg-yellow-100',
    },
    {
      title: 'Completed Tasks',
      count: stats.completed.toString(),
      icon: 'bi bi-check-circle-fill',
      iconcolor: 'text-green-600',
      iconbg: 'bg-green-300',
      color: 'bg-green-100',
    },
    {
      title: 'Failed Tasks',
      count: stats.failed.toString(),
      icon: 'bi bi-x-circle-fill',
      iconcolor: 'text-red-600',
      iconbg: 'bg-red-300',
      color: 'bg-red-100',
    },
  ];

  
  return (
    <div className="p-5 space-y-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {data.map((d, i) => (
      <OverviewCard
        key={i}
        title={d.title}
        count={d.count}
        icon={d.icon}
        iconbg={d.iconbg}
        iconcolor={d.iconcolor}
        color={d.color}
      />
    ))}
  </div>

    </div>
  )
}

export default EmpOverView