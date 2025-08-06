import { Translations } from './index';

export const zh: Translations = {
  nav: {
    formatter: 'JSON格式化',
    diff: 'JSON对比',
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
    }
  }
};