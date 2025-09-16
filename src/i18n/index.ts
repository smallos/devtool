// 国际化系统核心文件
export interface Translations {
  nav: {
    formatter: string;
    diff: string;
    excel: string;
    docToMarkdown: string;
    stateDiagram: string;
    markdownEditor: string;
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
  excel: {
    title: string;
    description: string;
    excelToJsonMode: string;
    jsonToExcelMode: string;
    csvToJsonMode: string;
    jsonToCsvMode: string;
    formatSelector: string;
    excelFormat: string;
    csvFormat: string;
    uploadLabel: string;
    uploadDescription: string;
    uploadHint: string;
    csvOptions: string;
    delimiter: string;
    encoding: string;
    hasHeader: string;
    delimiterComma: string;
    delimiterSemicolon: string;
    delimiterTab: string;
    delimiterPipe: string;
    csvExportOptions: string;
    selectFileButton: string;
    jsonInputLabel: string;
    jsonInputPlaceholder: string;
    convertButton: string;
    convertingText: string;
    downloadButton: string;
    resultLabel: string;
    clearButton: string;
    copyButton: string;
    historyTitle: string;
    noHistory: string;
    clearHistory: string;
    excelParseError: string;
    jsonInputRequired: string;
    jsonArrayRequired: string;
    jsonFormatError: string;
    copySuccess: string;
    copyError: string;
    excelToJsonHistory: string;
    jsonToExcelHistory: string;
    csvToJsonHistory: string;
    jsonToCsvHistory: string;
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
    excel: {
      title: string;
      description: string;
      keywords: string;
    };
    stateDiagram: {
      title: string;
      description: string;
      keywords: string;
    };
    docToMarkdown: {
      title: string;
      description: string;
      keywords: string;
    };
  };
  stateDiagram: {
    title: string;
    description: string;
    editor: {
      title: string;
      placeholder: string;
    };
    preview: {
      title: string;
      loading: string;
    };
    templates: {
      title: string;
      basic: string;
      userLogin: string;
      orderProcess: string;
      gameState: string;
    };
    history: {
      title: string;
      empty: string;
    };
    buttons: {
      copy: string;
      save: string;
      clear: string;
      reset: string;
      upload: string;
      showPreview: string;
      hidePreview: string;
      exportSvg: string;
      exportPng: string;
      exportHighResPng: string;
      codeEditor: string;
      templateLibrary: string;
      historyRecords: string;
      showEditor: string;
      hideEditor: string;
      zoomIn: string;
      zoomOut: string;
      resetView: string;
    };
    messages: {
      copied: string;
      saved: string;
      loaded: string;
      exported: string;
      fileLoaded: string;
      reset: string;
      templateApplied: string;
      historyCleared: string;
      noHistory: string;
    };
    errors: {
      renderFailed: string;
      exportFailed: string;
      noContent: string;
      emptyCode: string;
    };
    prompts: {
      saveName: string;
      resetCode: string;
      clearHistory: string;
    };
    tooltips: {
      saveToHistory: string;
      exportSvgFormat: string;
      exportPngFormat: string;
      exportHighResPngFormat: string;
      resetCode: string;
      showHideEditor: string;
      dragToResize: string;
    };
  };
  docToMarkdown: {
    title: string;
    description: string;
    upload: {
      title: string;
      dragText: string;
      selectFile: string;
      supportedFormats: string;
    };
    result: {
      title: string;
      copy: string;
      download: string;
      placeholder: string;
      empty: string;
    };
    converting: string;
    success: string;
    errors: {
      fileTooLarge: string;
      unsupportedFormat: string;
      docxConversion: string;
      pdfConversion: string;
      noTextFound: string;
      unknown: string;
    };
    instructions: {
      title: string;
      supported: {
        title: string;
      };
      features: {
        title: string;
        headings: string;
        paragraphs: string;
        lists: string;
        tables: string;
      };
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