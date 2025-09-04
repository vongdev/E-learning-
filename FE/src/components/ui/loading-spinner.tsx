import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  message = 'Đang tải dữ liệu...' 
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeMap[size]} border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4`}></div>
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
}