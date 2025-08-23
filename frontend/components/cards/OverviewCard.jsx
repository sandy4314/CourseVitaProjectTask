import React from 'react';

const OverviewCard = ({ title, count, icon, iconbg, iconcolor, color }) => {
  return (
    <div
      className={`relative w-full h-36 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden ${color}`}
    >
      {/* Icon Circle */}
      <div
        className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-md ${iconbg} ${iconcolor}`}
      >
        <i className={`${icon} text-xl`}></i>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>

      {/* Count */}
      <p className={`text-3xl font-bold ${iconcolor}`}>{count}</p>

      {/* Decorative line or progress style (optional) */}
      <div className={`mt-4 h-1 rounded-full ${iconbg} opacity-70 w-1/2`}></div>
    </div>
  );
};

export default OverviewCard;
