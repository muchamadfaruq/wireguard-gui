const PROVIDERS = ['https://api.ipify.org', 'https://ifconfig.me/ip', 'https://icanhazip.com'];

const OCTET = '(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';
const IPV4 = new RegExp(`^${OCTET}(\\.${OCTET}){3}$`);

export function isValidIpv4(value: string): boolean {
  return IPV4.test(value.trim());
}

/**
 * Best-effort detection of the server's public IPv4 address by querying a few
 * public services. Returns null when offline or when none respond in time.
 */
export async function detectPublicIpv4(timeoutMs = 2500): Promise<string | null> {
  for (const url of PROVIDERS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'text/plain' },
      });
      if (!response.ok) continue;
      const text = (await response.text()).trim();
      if (isValidIpv4(text)) return text;
    } catch {
      // try the next provider
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}
