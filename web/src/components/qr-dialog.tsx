import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function QrDialog({
  open,
  onOpenChange,
  title,
  description,
  imageUrl,
  downloadUrl,
  downloadName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  imageUrl: string;
  downloadUrl: string;
  downloadName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="flex items-center justify-center rounded-lg bg-white p-4">
          {open ? (
            <img src={imageUrl} alt="WireGuard QR code" className="h-64 w-64" />
          ) : null}
        </div>
        <Button asChild>
          <a href={downloadUrl} download={downloadName}>
            <Download />
            Download config
          </a>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
