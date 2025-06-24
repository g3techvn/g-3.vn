import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  stepNumber: number;
  children: React.ReactNode;
  isCompleted?: boolean;
  defaultOpen?: boolean;
}

export default function CollapsibleSection({
  title,
  stepNumber,
  children,
  isCompleted = false,
  defaultOpen = true
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-4 bg-white">
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isCompleted ? 'bg-green-50' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isCompleted ? 'bg-green-600' : 'bg-red-600'} text-white mr-3`}>
            {isCompleted ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              stepNumber
            )}
          </span>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <div className="flex items-center">
          {isCompleted && (
            <span className="text-green-600 mr-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đã hoàn thành
            </span>
          )}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className={`w-5 h-5 collapsible-arrow ${isOpen ? 'open' : ''} ${isCompleted ? 'text-green-600' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      <div className={`collapsible-content ${isOpen ? 'open' : 'closed'}`}>
        <div className="p-4 border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
} 