import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { en, type TranslationKey } from './locales/en';
import { id } from './locales/id';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';

export type Locale = 'en' | 'id' | 'es' | 'fr' | 'de';
export type { TranslationKey };

export interface LanguageOption {
  code: Locale;
  label: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

type Dictionary = Partial<Record<TranslationKey, string>>;

const DICTIONARIES: Record<Locale, Dictionary> = { en, id, es, fr, de };
const STORAGE_KEY = 'wg-gui-language';

function isLocale(value: string | null): value is Locale {
  return value !== null && LANGUAGES.some((language) => language.code === value);
}

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
    const browser = navigator.language?.slice(0, 2).toLowerCase();
    if (isLocale(browser ?? null)) return browser as Locale;
  } catch {
    // ignore (e.g. private mode)
  }
  return 'en';
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => detectLocale());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const value = DICTIONARIES[locale]?.[key] ?? en[key] ?? key;
      if (!params) return value;
      return Object.entries(params).reduce(
        (result, [name, replacement]) =>
          result.replace(new RegExp(`\\{${name}\\}`, 'g'), String(replacement)),
        value,
      );
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
