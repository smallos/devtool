import { useState, useEffect } from 'react';
import { translations, Language } from '../i18n';

// 本地存储键名
const LANGUAGE_STORAGE_KEY = 'json-tools-language';

// 检测浏览器语言
const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh';
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'zh';
  
  // 如果浏览器语言是中文相关，返回中文，否则返回英文
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
};

// 从localStorage获取保存的语言，如果没有则使用浏览器检测
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'zh';
  
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
  if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
    return savedLanguage;
  }
  
  return detectBrowserLanguage();
};

// 全局语言状态
let globalLanguage: Language = getInitialLanguage();
const listeners: Array<(language: Language) => void> = [];

// 改变语言的函数
const changeLanguage = (newLanguage: Language) => {
  globalLanguage = newLanguage;
  
  // 保存到localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
  }
  
  listeners.forEach(listener => listener(newLanguage));
};

export const useI18n = () => {
  const [language, setLanguage] = useState<Language>(globalLanguage);

  useEffect(() => {
    // 初始化时设置正确的语言
    const initialLanguage = getInitialLanguage();
    if (initialLanguage !== globalLanguage) {
      changeLanguage(initialLanguage);
    }
    
    const listener = (newLanguage: Language) => {
      setLanguage(newLanguage);
    };

    listeners.push(listener);

    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  // 确保t函数始终有效，如果language无效则使用默认语言
  const t = translations[language] || translations['zh'];

  return {
    language,
    changeLanguage,
    t
  };
};

// 获取当前语言的翻译（用于非组件中）
export const getTranslations = (language?: Language) => {
  const lang = language || globalLanguage;
  return translations[lang];
};