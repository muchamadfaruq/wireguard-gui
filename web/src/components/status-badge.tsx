import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();
  return (
    <Badge variant={running ? 'success' : 'secondary'} className="gap-1.5">
      <StatusDot active={running} />
      {running ? t('common.running') : t('common.stopped')}
    </Badge>
  );
}

export function OnlineBadge({ online }: { online: boolean }) {
  const { t } = useI18n();
  return (
    <Badge variant={online ? 'success' : 'secondary'} className="gap-1.5">
      <StatusDot active={online} />
      {online ? t('common.online') : t('common.offline')}
    </Badge>
  );
}
