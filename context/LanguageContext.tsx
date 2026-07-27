'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { TRANSLATIONS } from '@/data/translations';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string) => string;
}

const STORAGE_KEY = 'portfolio_lang';
const DEFAULT_LANGUAGE: Language = 'es';

/**
 * The selected language lives outside React: it is persisted in localStorage and
 * must survive a page that is prerendered as static HTML. Exposing it through
 * `useSyncExternalStore` lets the server render the Spanish default and the
 * client adopt the stored preference during hydration, without a setState-in-
 * effect cascade and without a hydration mismatch.
 */
const languageStore = (() => {
  const listeners = new Set<() => void>();
  let current: Language = DEFAULT_LANGUAGE;
  let hydrated = false;

  const read = (): Language => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved === 'es' || saved === 'en' ? saved : DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  };

  return {
    subscribe(listener: () => void) {
      // First subscription happens after hydration, so adopting the stored
      // value here cannot desynchronise the server-rendered markup.
      if (!hydrated) {
        hydrated = true;
        current = read();
      }
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot(): Language {
      return current;
    },
    getServerSnapshot(): Language {
      return DEFAULT_LANGUAGE;
    },
    set(lang: Language) {
      if (lang === current) return;
      current = lang;
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Private mode or blocked storage: the in-memory value still applies.
      }
      listeners.forEach((listener) => listener());
    },
  };
})();

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/** Walks a dotted path through a translation dictionary. */
function lookup(dictionary: unknown, keys: string[]): string | undefined {
  let current: unknown = dictionary;
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as Record<string, unknown>)[key];
    if (current === undefined) return undefined;
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    languageStore.subscribe,
    languageStore.getSnapshot,
    languageStore.getServerSnapshot
  );

  // Keep the document language in sync so assistive technology and translation
  // tools announce the page in the language actually on screen.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => languageStore.set(lang), []);

  const toggleLanguage = useCallback(
    () => languageStore.set(language === 'es' ? 'en' : 'es'),
    [language]
  );

  const t = useCallback(
    (path: string): string => {
      const keys = path.split('.');
      return lookup(TRANSLATIONS[language], keys) ?? lookup(TRANSLATIONS.es, keys) ?? path;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
