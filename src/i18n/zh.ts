import { Translations } from './index';

export const zh: Translations = {
  nav: {
    formatter: 'JSON格式化',
    diff: 'JSON对比',
    excel: '数据转换',
    docToMarkdown: '文档转Markdown',
    stateDiagram: '状态图绘制',
    language: '语言'
  },
  formatter: {
    title: 'JSON格式化工具',
    description: '在线JSON格式化、压缩、转义工具，支持语法高亮和错误检测',
    inputPlaceholder: '请输入JSON数据...',
    outputLabel: '格式化结果',
    formatButton: '格式化',
    compressButton: '压缩',
    escapeButton: '转义',
    clearButton: '清空',
    copyButton: '复制',
    historyTitle: '历史记录',
    noHistory: '暂无历史记录',
    clearHistory: '清空历史',
    formatSuccess: 'JSON格式化成功',
    formatError: 'JSON格式错误，请检查输入',
    copySuccess: '复制成功',
    copyError: '复制失败'
  },
  diff: {
    title: 'JSON对比工具',
    description: '在线JSON数据对比工具，快速发现两个JSON之间的差异',
    leftLabel: '左侧JSON',
    rightLabel: '右侧JSON',
    leftPlaceholder: '请输入第一个JSON数据...',
    rightPlaceholder: '请输入第二个JSON数据...',
    compareButton: '开始对比',
    clearButton: '清空',
    copyLeftButton: '复制左侧',
    copyRightButton: '复制右侧',
    historyTitle: '对比历史',
    noHistory: '暂无对比历史',
    clearHistory: '清空历史',
    compareSuccess: '对比完成',
    compareError: 'JSON格式错误，请检查输入',
    copySuccess: '复制成功',
    copyError: '复制失败',
    noDifference: '两个JSON完全相同',
    differencesFound: '发现差异'
  },
  excel: {
    title: '数据转换工具',
    description: '支持Excel、CSV文件与JSON数据的双向转换，简单易用的在线数据格式转换工具',
    excelToJsonMode: 'Excel转JSON',
    jsonToExcelMode: 'JSON转Excel',
    csvToJsonMode: 'CSV转JSON',
    jsonToCsvMode: 'JSON转CSV',
    formatSelector: '数据格式',
    excelFormat: 'Excel格式',
    csvFormat: 'CSV格式',
    uploadLabel: '上传Excel文件',
    uploadDescription: '点击选择Excel文件或拖拽文件到此处',
    uploadHint: '支持 .xlsx、.xls 和 .csv 格式',
    csvOptions: 'CSV选项',
    delimiter: '分隔符',
    encoding: '编码',
    hasHeader: '包含表头',
    delimiterComma: '逗号 (,)',
    delimiterSemicolon: '分号 (;)',
    delimiterTab: '制表符 (Tab)',
    delimiterPipe: '竖线 (|)',
    csvExportOptions: 'CSV导出选项',
    selectFileButton: '选择文件',
    jsonInputLabel: '输入JSON数据',
    jsonInputPlaceholder: '请输入JSON数组数据，例如：[{"name": "张三", "age": 25}, {"name": "李四", "age": 30}]',
    convertButton: '转换并下载Excel',
    convertingText: '转换中...',
    downloadButton: '下载Excel',
    resultLabel: '转换结果 (JSON)',
    clearButton: '清空',
    copyButton: '复制',
    historyTitle: '转换历史',
    noHistory: '暂无转换历史',
    clearHistory: '清空历史',
    excelParseError: 'Excel文件解析失败，请检查文件格式',
    jsonInputRequired: '请输入JSON数据',
    jsonArrayRequired: 'JSON数据必须是数组格式',
    jsonFormatError: 'JSON格式错误，请检查输入数据',
    copySuccess: '复制成功',
    copyError: '复制失败',
    excelToJsonHistory: 'Excel→JSON',
    jsonToExcelHistory: 'JSON→Excel',
    csvToJsonHistory: 'CSV→JSON',
    jsonToCsvHistory: 'JSON→CSV'
  },
  seo: {
    formatter: {
      title: 'JSON格式化工具 - 在线JSON美化、压缩、转义',
      description: '免费的在线JSON格式化工具，支持JSON美化、压缩、转义功能。提供语法高亮、错误检测、历史记录等实用功能，是开发者必备的JSON处理工具。',
      keywords: 'JSON格式化,JSON美化,JSON压缩,JSON转义,在线JSON工具,JSON验证,JSON编辑器'
    },
    diff: {
      title: 'JSON对比工具 - 在线JSON差异检测',
      description: '专业的在线JSON对比工具，快速检测两个JSON数据之间的差异。支持语法高亮、智能对比、历史记录等功能，帮助开发者高效处理JSON数据对比需求。',
      keywords: 'JSON对比,JSON差异,JSON比较,在线对比工具,JSON检测,数据对比,JSON分析'
    },
    excel: {
      title: '数据转换工具 - 在线Excel转JSON，CSV转JSON，数据格式转换',
      description: '免费的在线数据转换工具，支持Excel、CSV文件与JSON数据的双向转换。支持文件上传、自定义分隔符、编码设置等功能，简单易用。',
      keywords: 'Excel转JSON,CSV转JSON,JSON转Excel,JSON转CSV,数据转换工具,在线转换,Excel处理,CSV处理,JSON处理'
    },
    stateDiagram: {
      title: '状态图绘制工具 - 在线Mermaid状态图编辑器',
      description: '专业的在线状态图绘制工具，基于Mermaid语法，支持实时预览、PNG/SVG导出、模板库、历史记录等功能。轻松创建流程图、状态转换图。',
      keywords: '状态图,Mermaid,流程图,状态转换图,在线绘图,图表工具,PNG导出,SVG导出,状态机'
    },
    docToMarkdown: {
      title: '文档转Markdown工具 - 在线DOC/PDF转Markdown转换器',
      description: '专业的在线文档转换工具，支持DOCX、PDF等格式转换为Markdown。保持原文档格式，支持标题、段落、列表、表格等元素转换。',
      keywords: 'DOC转Markdown,PDF转Markdown,DOCX转换,文档转换,Markdown转换器,在线转换工具'
    }
  },
  stateDiagram: {
    title: '状态图绘制工具',
    description: '基于Mermaid语法的在线状态图编辑器，支持实时预览和图片导出',
    editor: {
      title: '代码编辑器',
      placeholder: '请输入Mermaid状态图代码...'
    },
    preview: {
      title: '实时预览',
      loading: '渲染中...'
    },
    templates: {
      title: '模板库',
      basic: '基础状态图',
      userLogin: '用户登录流程',
      orderProcess: '订单处理流程',
      gameState: '游戏状态机'
    },
    history: {
      title: '历史记录',
      empty: '暂无历史记录'
    },
    buttons: {
      copy: '复制代码',
      save: '保存',
      clear: '清空',
      reset: '重置',
      upload: '上传文件',
      showPreview: '显示预览',
      hidePreview: '隐藏预览',
      exportSvg: 'SVG',
      exportPng: 'PNG',
      exportHighResPng: '高清PNG',
      codeEditor: '代码编辑',
      templateLibrary: '模板库',
      historyRecords: '历史记录',
      showEditor: '显示编辑器',
      hideEditor: '隐藏编辑器',
      zoomIn: '放大',
      zoomOut: '缩小',
      resetView: '重置视图'
    },
    messages: {
      copied: '代码已复制到剪贴板',
      saved: '已保存到历史记录',
      loaded: '已从历史记录加载',
      exported: '导出成功',
      fileLoaded: '文件加载成功',
      reset: '已重置为默认代码',
      templateApplied: '模板应用成功',
      historyCleared: '历史记录已清空',
      noHistory: '保存图表后会在这里显示历史记录'
    },
    errors: {
      renderFailed: '状态图渲染失败，请检查代码语法',
      exportFailed: '导出失败，请重试',
      noContent: '没有可导出的内容',
      emptyCode: '代码不能为空'
    },
    prompts: {
      saveName: '请输入保存名称：',
      resetCode: '确定要重置代码吗？这将清除当前的所有修改。',
      clearHistory: '确定要清空所有历史记录吗？此操作不可撤销。'
    },
    tooltips: {
       saveToHistory: '保存到历史记录',
       exportSvgFormat: '导出SVG格式',
       exportPngFormat: '导出PNG格式',
       exportHighResPngFormat: '导出高清PNG格式',
       resetCode: '重置代码',
       showHideEditor: '显示/隐藏编辑器',
       dragToResize: '拖拽调整大小'
  }
   },
   docToMarkdown: {
     title: '文档转Markdown工具',
     description: '支持DOCX、PDF等文档格式转换为Markdown，保持原文档格式和结构',
     upload: {
       title: '上传文档',
       dragText: '拖拽文件到此处或点击选择文件',
       selectFile: '选择文件',
       supportedFormats: '支持格式：DOCX、PDF、DOC（最大10MB）'
     },
     result: {
       title: 'Markdown结果',
       copy: '复制',
       download: '下载',
       placeholder: '转换后的Markdown内容将在这里显示...',
       empty: '请先上传文档文件'
     },
     converting: '正在转换文档...',
     success: '文档 {{fileName}} 转换成功！',
     errors: {
       fileTooLarge: '文件大小超过10MB限制',
       unsupportedFormat: '不支持的文件格式，请上传DOCX、PDF或DOC文件',
       docxConversion: 'DOCX文件转换失败，请检查文件是否损坏',
       pdfConversion: 'PDF文件转换失败，请检查文件是否损坏',
       noTextFound: 'PDF文件中未找到可提取的文本内容',
       unknown: '转换过程中发生未知错误，请重试'
     },
     instructions: {
       title: '使用说明',
       supported: {
         title: '支持的文件格式'
       },
       features: {
         title: '转换功能',
         headings: '标题层级转换',
         paragraphs: '段落格式保持',
         lists: '列表结构转换',
         tables: '表格格式转换'
       }
     }
   }
};