import { useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { formatBytes, formatDate } from '@/lib/format';

/**
 * Locale-aware formatting helpers. `formatBytes` and `formatDate` are
 * language independent, while the handshake label is translated.
 */
export function useFormat() {
  const { t } = useI18n();

  const handshake = useCallback(
    (unixSeconds: number | null): string => {
      if (!unixSeconds) return t('common.never');
      const diff = Math.floor(Date.now() / 1000) - unixSeconds;
      if (diff < 60) return t('time.secondsAgo', { n: diff });
      if (diff < 3600) return t('time.minutesAgo', { n: Math.floor(diff / 60) });
      if (diff < 86400) return t('time.hoursAgo', { n: Math.floor(diff / 3600) });
      return t('time.daysAgo', { n: Math.floor(diff / 86400) });
    },
    [t],
  );

  return { handshake, bytes: formatBytes, date: formatDate };
}
