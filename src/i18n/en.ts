import { Translations } from './index';

export const en: Translations = {
  nav: {
    formatter: 'JSON Formatter',
    diff: 'JSON Diff',
    language: 'Language'
  },
  formatter: {
    title: 'JSON Formatter Tool',
    description: 'Online JSON formatter, compressor, and escape tool with syntax highlighting and error detection',
    inputPlaceholder: 'Enter JSON data...',
    outputLabel: 'Formatted Result',
    formatButton: 'Format',
    compressButton: 'Compress',
    escapeButton: 'Escape',
    clearButton: 'Clear',
    copyButton: 'Copy',
    historyTitle: 'History',
    noHistory: 'No history records',
    clearHistory: 'Clear History',
    formatSuccess: 'JSON formatted successfully',
    formatError: 'Invalid JSON format, please check your input',
    copySuccess: 'Copied successfully',
    copyError: 'Copy failed'
  },
  diff: {
    title: 'JSON Diff Tool',
    description: 'Online JSON comparison tool to quickly find differences between two JSON objects',
    leftLabel: 'Left JSON',
    rightLabel: 'Right JSON',
    leftPlaceholder: 'Enter first JSON data...',
    rightPlaceholder: 'Enter second JSON data...',
    compareButton: 'Compare',
    clearButton: 'Clear',
    copyLeftButton: 'Copy Left',
    copyRightButton: 'Copy Right',
    historyTitle: 'Comparison History',
    noHistory: 'No comparison history',
    clearHistory: 'Clear History',
    compareSuccess: 'Comparison completed',
    compareError: 'Invalid JSON format, please check your input',
    copySuccess: 'Copied successfully',
    copyError: 'Copy failed',
    noDifference: 'Both JSON objects are identical',
    differencesFound: 'Differences found'
  },
  seo: {
    formatter: {
      title: 'JSON Formatter Tool - Online JSON Beautifier, Compressor & Escape',
      description: 'Free online JSON formatter tool with beautify, compress, and escape functions. Features syntax highlighting, error detection, and history records - essential tool for developers.',
      keywords: 'JSON formatter,JSON beautifier,JSON compressor,JSON escape,online JSON tool,JSON validator,JSON editor'
    },
    diff: {
      title: 'JSON Diff Tool - Online JSON Difference Detector',
      description: 'Professional online JSON comparison tool to quickly detect differences between two JSON objects. Features syntax highlighting, smart comparison, and history records for efficient JSON data analysis.',
      keywords: 'JSON diff,JSON difference,JSON compare,online comparison tool,JSON detection,data comparison,JSON analysis'
    }
  }
};