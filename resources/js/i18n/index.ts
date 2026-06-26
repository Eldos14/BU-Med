import en from './en';
import kz from './kz';
import ru from './ru';
import type { TranslationKeys } from './ru';

export type Lang = 'ru' | 'kz' | 'en';

export type { TranslationKeys };

const translations: Record<Lang, Record<TranslationKeys, string>> = { ru, kz, en };

export function t(lang: Lang, key: TranslationKeys): string {
    return translations[lang][key] ?? translations['ru'][key] ?? key;
}

export function getStoredLang(): Lang {
    if (typeof localStorage === 'undefined') return 'ru';
    const stored = localStorage.getItem('app_lang');
    if (stored === 'kz' || stored === 'en' || stored === 'ru') return stored;
    return 'ru';
}

export function setStoredLang(lang: Lang): void {
    localStorage.setItem('app_lang', lang);
}
