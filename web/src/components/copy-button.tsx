import { toast } from 'sonner';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyButton({
  value,
  label = 'Copy',
  className,
  variant = 'outline',
}: {
  value: string;
  label?: string;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary';
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Button type="button" variant={variant} size="sm" onClick={copy} className={className}>
      {copied ? <Check /> : <Copy />}
      {label}
    </Button>
  );
}
