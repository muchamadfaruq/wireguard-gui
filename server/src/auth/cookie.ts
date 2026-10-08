import { config } from '../config';

export const SESSION_COOKIE = 'wg_session';

export function sessionCookieOptions(): {
  httpOnly: boolean;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.env.COOKIE_SECURE,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  };
}
