// 国际化系统核心文件
export interface Translations {
  nav: {
    formatter: string;
    diff: string;
    language: string;
  };
  formatter: {
    title: string;
    description: string;
    inputPlaceholder: string;
    outputLabel: string;
    formatButton: string;
    compressButton: string;
    escapeButton: string;
    clearButton: string;
    copyButton: string;
    historyTitle: string;
    noHistory: string;
    clearHistory: string;
    formatSuccess: string;
    formatError: string;
    copySuccess: string;
    copyError: string;
  };
  diff: {
    title: string;
    description: string;
    leftLabel: string;
    rightLabel: string;
    leftPlaceholder: string;
    rightPlaceholder: string;
    compareButton: string;
    clearButton: string;
    copyLeftButton: string;
    copyRightButton: string;
    historyTitle: string;
    noHistory: string;
    clearHistory: string;
    compareSuccess: string;
    compareError: string;
    copySuccess: string;
    copyError: string;
    noDifference: string;
    differencesFound: string;
  };
  seo: {
    formatter: {
      title: string;
      description: string;
      keywords: string;
    };
    diff: {
      title: string;
      description: string;
      keywords: string;
    };
  };
}

export type Language = 'zh' | 'en';

export const SUPPORTED_LANGUAGES: Language[] = ['zh', 'en'];

export const LANGUAGE_NAMES: Record<Language, string> = {
  zh: '中文',
  en: 'English'
};

// 获取浏览器默认语言
export const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
};

// 从localStorage获取语言设置
export const getStoredLanguage = (): Language | null => {
  const stored = localStorage.getItem('json-tool-language');
  if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
    return stored as Language;
  }
  return null;
};

// 保存语言设置到localStorage
export const setStoredLanguage = (language: Language): void => {
  localStorage.setItem('json-tool-language', language);
};

// 获取当前应该使用的语言
export const getCurrentLanguage = (): Language => {
  return getStoredLanguage() || getBrowserLanguage();
};

// 导入翻译文件
import { zh } from './zh';
import { en } from './en';

// 翻译对象映射
export const translations: Record<Language, Translations> = {
  zh,
  en
};