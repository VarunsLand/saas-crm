import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  successMessage?: string;
}

export function CopyButton({ text, className, successMessage = 'Copied to clipboard' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(successMessage);
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (!text) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors", className)}
      onClick={handleCopy}
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}
