import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Mail } from 'lucide-react';
import React from 'react';

interface EmailButtonProps {
  email: string | null | undefined;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function EmailButton({ 
  email, 
  className, 
  variant = 'outline', 
  size = 'icon' 
}: EmailButtonProps) {
  
  if (!email) return null;

  const mailtoUrl = `mailto:${email}`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click in tables
    window.location.href = mailtoUrl;
  };

  return (
    <Button 
      type="button" 
      variant={variant} 
      size={size} 
      className={cn(
        'text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-500 dark:border-blue-800 dark:hover:bg-blue-950', 
        className
      )}
      onClick={handleClick}
      title="Send Email"
    >
      <Mail className={size === 'icon' || size === 'sm' ? "w-4 h-4" : "w-4 h-4 mr-2"} />
      {size !== 'icon' && size !== 'sm' && <span>Email</span>}
      {size === 'sm' && <span className="ml-2">Email</span>}
    </Button>
  );
}
