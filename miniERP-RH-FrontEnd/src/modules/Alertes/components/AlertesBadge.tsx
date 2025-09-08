import React from 'react';
import { useAlertes } from '../contexts/AlertesProvider';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface AlertesBadgeProps {
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
}

export const AlertesBadge: React.FC<AlertesBadgeProps> = ({
  className = '',
  showIcon = true,
  size = 'md',
  variant = 'destructive'
}) => {
  const { stats, isConnected } = useAlertes();

  // Ne pas afficher si pas de notifications non lues
  if (stats.nonLues === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm', 
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && (
        <div className="relative">
          <Bell className="w-4 h-4" />
          {!isConnected && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
          )}
        </div>
      )}
      <Badge 
        variant={variant}
        className={`${sizeClasses[size]} ${isConnected ? '' : 'bg-yellow-600 hover:bg-yellow-700'}`}
      >
        {stats.nonLues > 99 ? '99+' : stats.nonLues}
      </Badge>
    </div>
  );
};
