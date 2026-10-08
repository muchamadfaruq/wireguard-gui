import { toast } from 'sonner';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

function fallbackCopy(value: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({
  value,
  label = 'Copy',
  className,
  variant = 'outline',
  disabled = false,
  title,
}: {
  value: string;
  label?: string;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary';
  disabled?: boolean;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    let ok = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(value);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) ok = fallbackCopy(value);

    if (ok) {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={copy}
      disabled={disabled}
      title={title}
      className={className}
    >
      {copied ? <Check /> : <Copy />}
      {label}
    </Button>
  );
}
