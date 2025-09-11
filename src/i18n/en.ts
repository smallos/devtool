import { Translations } from './index';

export const en: Translations = {
  nav: {
    formatter: 'JSON Formatter',
    diff: 'JSON Diff',
    excel: 'Data Converter',
    stateDiagram: 'State Diagram',
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
  excel: {
    title: 'Data Converter Tool',
    description: 'Bidirectional conversion between Excel, CSV files and JSON data, easy-to-use online data format conversion tool',
    excelToJsonMode: 'Excel to JSON',
    jsonToExcelMode: 'JSON to Excel',
    csvToJsonMode: 'CSV to JSON',
    jsonToCsvMode: 'JSON to CSV',
    formatSelector: 'Data Format',
    excelFormat: 'Excel Format',
    csvFormat: 'CSV Format',
    uploadLabel: 'Upload Excel File',
    uploadDescription: 'Click to select Excel file or drag file here',
    uploadHint: 'Supports .xlsx, .xls and .csv formats',
    csvOptions: 'CSV Options',
    delimiter: 'Delimiter',
    encoding: 'Encoding',
    hasHeader: 'Has Header',
    delimiterComma: 'Comma (,)',
    delimiterSemicolon: 'Semicolon (;)',
    delimiterTab: 'Tab',
    delimiterPipe: 'Pipe (|)',
    csvExportOptions: 'CSV Export Options',
    selectFileButton: 'Select File',
    jsonInputLabel: 'Input JSON Data',
    jsonInputPlaceholder: 'Please enter JSON array data, e.g.: [{"name": "John", "age": 25}, {"name": "Jane", "age": 30}]',
    convertButton: 'Convert & Download Excel',
    convertingText: 'Converting...',
    downloadButton: 'Download Excel',
    resultLabel: 'Conversion Result (JSON)',
    clearButton: 'Clear',
    copyButton: 'Copy',
    historyTitle: 'Conversion History',
    noHistory: 'No conversion history',
    clearHistory: 'Clear History',
    excelParseError: 'Excel file parsing failed, please check file format',
    jsonInputRequired: 'Please input JSON data',
    jsonArrayRequired: 'JSON data must be in array format',
    jsonFormatError: 'JSON format error, please check input data',
    copySuccess: 'Copied successfully',
    copyError: 'Copy failed',
    excelToJsonHistory: 'Excel→JSON',
    jsonToExcelHistory: 'JSON→Excel',
    csvToJsonHistory: 'CSV→JSON',
    jsonToCsvHistory: 'JSON→CSV'
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
    },
    excel: {
      title: 'Data Converter Tool - Online Excel to JSON, CSV to JSON, Data Format Conversion',
      description: 'Free online data conversion tool supporting bidirectional conversion between Excel, CSV files and JSON data. Features file upload, custom delimiters, encoding settings, simple and easy to use.',
      keywords: 'Excel to JSON,CSV to JSON,JSON to Excel,JSON to CSV,data converter,online converter,Excel processing,CSV processing,JSON processing'
    },
    stateDiagram: {
      title: 'State Diagram Tool - Online Mermaid State Diagram Editor',
      description: 'Professional online state diagram drawing tool based on Mermaid syntax. Features real-time preview, PNG/SVG export, template library, and history records. Easily create flowcharts and state transition diagrams.',
      keywords: 'state diagram,Mermaid,flowchart,state transition,online drawing,chart tool,PNG export,SVG export,state machine'
    }
  },
  stateDiagram: {
    title: 'State Diagram Tool',
    description: 'Online state diagram editor based on Mermaid syntax with real-time preview and image export',
    editor: {
      title: 'Code Editor',
      placeholder: 'Enter Mermaid state diagram code...'
    },
    preview: {
      title: 'Live Preview',
      loading: 'Rendering...'
    },
    templates: {
      title: 'Template Library',
      basic: 'Basic State Diagram',
      userLogin: 'User Login Flow',
      orderProcess: 'Order Process Flow',
      gameState: 'Game State Machine'
    },
    history: {
      title: 'History',
      empty: 'No history records'
    },
    buttons: {
      copy: 'Copy Code',
      save: 'Save',
      clear: 'Clear',
      reset: 'Reset',
      upload: 'Upload File',
      showPreview: 'Show Preview',
      hidePreview: 'Hide Preview',
      exportSvg: 'SVG',
      exportPng: 'PNG',
      exportHighResPng: 'High-Res PNG',
      codeEditor: 'Code Editor',
      templateLibrary: 'Template Library',
      historyRecords: 'History Records',
      showEditor: 'Show Editor',
      hideEditor: 'Hide Editor',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetView: 'Reset View'
    },
    messages: {
      copied: 'Code copied to clipboard',
      saved: 'Saved to history',
      loaded: 'Loaded from history',
      exported: 'Export successful',
      fileLoaded: 'File loaded successfully',
      reset: 'Reset to default code',
      templateApplied: 'Template applied successfully',
      historyCleared: 'History cleared',
      noHistory: 'History records will be displayed here after saving diagrams'
    },
    errors: {
      renderFailed: 'State diagram rendering failed, please check code syntax',
      exportFailed: 'Export failed, please try again',
      noContent: 'No content to export',
      emptyCode: 'Code cannot be empty'
    },
    prompts: {
      saveName: 'Enter save name:',
      resetCode: 'Are you sure you want to reset the code? This will clear all current modifications.',
      clearHistory: 'Are you sure you want to clear all history records? This action cannot be undone.'
    },
    tooltips: {
       saveToHistory: 'Save to history',
       exportSvgFormat: 'Export SVG format',
       exportPngFormat: 'Export PNG format',
       exportHighResPngFormat: 'Export high-resolution PNG format',
       resetCode: 'Reset code',
       showHideEditor: 'Show/Hide editor',
       dragToResize: 'Drag to resize'
     }
  }
};