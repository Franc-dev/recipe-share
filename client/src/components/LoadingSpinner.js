import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-64">
      <div className={`animate-spin rounded-full border-b-2 border-orange-500 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 text-lg">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 