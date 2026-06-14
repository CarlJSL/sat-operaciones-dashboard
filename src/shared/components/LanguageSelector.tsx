import type { ChangeEvent } from 'react';
import { ChevronDown, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/core/i18n';
import { cn } from '@/core/lib/utils';

interface LanguageSelectorProps {
  className?: string;
}

const LANGUAGE_LABEL_KEYS: Record<SupportedLanguage, string> = {
  es: 'common.spanish',
  qu: 'common.quechua',
};

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const currentLanguage = SUPPORTED_LANGUAGES.includes(i18n.resolvedLanguage as SupportedLanguage)
    ? (i18n.resolvedLanguage as SupportedLanguage)
    : 'es';

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(event.target.value as SupportedLanguage);
  };

  return (
    <label
      className={cn(
        'relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-platform-blue/20 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-md shadow-zinc-900/5 transition-colors hover:border-platform-blue/40 hover:bg-blue-50/40',
        className
      )}
    >
      <Languages className="size-4 text-zinc-500" aria-hidden="true" />
      <span>{t('common.language')}</span>
      <span className="font-black text-platform-blue">{t(LANGUAGE_LABEL_KEYS[currentLanguage])}</span>
      <ChevronDown className="size-3.5 text-zinc-500" aria-hidden="true" />
      <select
        aria-label={t('common.language')}
        className="absolute inset-0 cursor-pointer opacity-0"
        value={currentLanguage}
        onChange={handleChange}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {t(LANGUAGE_LABEL_KEYS[language])}
          </option>
        ))}
      </select>
    </label>
  );
}

