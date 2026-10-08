import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function StatusDot({ active, className }: { active: boolean; className?: string }) {
  return (
    <span className={cn('relative flex h-2.5 w-2.5', className)}>
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
      )}
      <span
        className={cn(
          'relative inline-flex h-2.5 w-2.5 rounded-full',
          active ? 'bg-success' : 'bg-muted-foreground/50',
        )}
      />
    </span>
  );
}

export function ServerStatusBadge({ running }: { running: boolean }) {
  return (
    <Badge variant={running ? 'success' : 'secondary'} className="gap-1.5">
      <StatusDot active={running} />
      {running ? 'Running' : 'Stopped'}
    </Badge>
  );
}

export function OnlineBadge({ online }: { online: boolean }) {
  return (
    <Badge variant={online ? 'success' : 'secondary'} className="gap-1.5">
      <StatusDot active={online} />
      {online ? 'Online' : 'Offline'}
    </Badge>
  );
}
