import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className = '' }) => {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className={`flex-1 lg:ml-64 transition-all duration-300 ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default MobileLayout;