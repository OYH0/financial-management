import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MobileCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const MobileCard: React.FC<MobileCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  className = '',
  children 
}) => {
  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-xl rounded-2xl ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon && <div className="flex-shrink-0">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-xl lg:text-3xl font-bold mb-2">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileCard;