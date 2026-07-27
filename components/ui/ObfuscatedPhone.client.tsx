'use client';

import { useEffect, useState } from 'react';
import { Phone, Eye } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Phone number kept out of the served HTML.
 *
 * The digits are stored as character codes and assembled only in the browser,
 * after either an explicit click or a dwell delay that proves a real session.
 * A scraper reading the page source, or one that renders but leaves
 * immediately, never sees a phone number to harvest.
 *
 * This is friction, not cryptography — a determined headless crawler that waits
 * could still get it. It defeats the bulk `tel:`/regex sweeps that actually
 * generate spam calls, which is the threat worth addressing here.
 */
const PHONE_CODES = [43, 53, 57, 49, 32, 55, 50, 50, 57, 53, 57, 57, 54]; // "+591 72295996"

/** Dwell time before the number self-reveals for an engaged reader. */
const ENGAGEMENT_REVEAL_MS = 15_000;

function decodePhone(): string {
  return String.fromCharCode(...PHONE_CODES);
}

/** Strips spaces for the tel: href, which must be dial-ready. */
function toTelHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, '')}`;
}

interface ObfuscatedPhoneProps {
  /**
   * `card` is the full contact-card row; `inline` is the compact pill used in
   * the CV header. Both must gate the number — protecting one and printing it
   * in the other would defeat the whole exercise.
   */
  variant?: 'card' | 'inline';
}

export default function ObfuscatedPhone({ variant = 'card' }: ObfuscatedPhoneProps) {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  // Reveal after sustained engagement, so a reader who scrolls and reads never
  // has to click, while a drive-by fetch still gets nothing.
  useEffect(() => {
    if (revealed) return;
    const timer = setTimeout(() => {
      setPhone(decodePhone());
      setRevealed(true);
    }, ENGAGEMENT_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [revealed]);

  const reveal = () => {
    setPhone(decodePhone());
    setRevealed(true);
  };

  if (variant === 'inline') {
    return revealed && phone ? (
      <a
        href={toTelHref(phone)}
        data-testid="phone-link"
        className="flex min-h-[36px] items-center space-x-1.5 rounded border border-slate-800 bg-slate-950 px-3 py-1 text-teal-300 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        <Phone className="h-3.5 w-3.5 shrink-0 text-teal-400" />
        <span>{phone}</span>
      </a>
    ) : (
      <button
        type="button"
        onClick={reveal}
        data-testid="reveal-phone-inline"
        className="flex min-h-[36px] items-center space-x-1.5 rounded border border-slate-800 bg-slate-950 px-3 py-1 text-slate-300 hover:bg-slate-800 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        <Phone className="h-3.5 w-3.5 shrink-0 text-teal-400" />
        <span className="select-none blur-[3px]" aria-hidden="true">
          +591 7•• •••
        </span>
        <span className="sr-only">{t('contact.revealPhone')}</span>
      </button>
    );
  }

  if (!revealed || !phone) {
    return (
      <button
        type="button"
        onClick={reveal}
        data-testid="reveal-phone"
        className="flex w-full min-h-[44px] items-center space-x-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-left text-slate-200 transition-all hover:border-teal-500/50 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        <Phone className="h-4 w-4 shrink-0 text-teal-400" />
        <span className="min-w-0">
          <span className="block text-[10px] text-slate-500">{t('contact.phoneLabel')}</span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="select-none blur-[3px]" aria-hidden="true">
              +591 7•• ••• ••
            </span>
            <Eye className="h-3.5 w-3.5 shrink-0 text-teal-400" />
          </span>
        </span>
        <span className="sr-only">{t('contact.revealPhone')}</span>
      </button>
    );
  }

  return (
    <a
      href={toTelHref(phone)}
      data-testid="phone-link"
      className="flex min-h-[44px] items-center space-x-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-200 transition-all hover:border-teal-500/50 hover:text-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    >
      <Phone className="h-4 w-4 shrink-0 text-teal-400" />
      <span>
        <span className="block text-[10px] text-slate-500">{t('contact.phoneLabel')}</span>
        <span className="font-bold">{phone}</span>
      </span>
    </a>
  );
}
