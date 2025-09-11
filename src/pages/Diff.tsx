import React, { useState, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Copy, Upload, Download, RotateCcw, Eye, EyeOff, ChevronUp, ChevronDown, Filter, GitCompare } from 'lucide-react';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';
import { useI18n } from '../hooks/useI18n';

type ViewMode = 'split' | 'unified';

interface DiffResult {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  path: string;
  leftValue?: any;
  rightValue?: any;
  children?: DiffResult[];
}

const Diff: React.FC = () => {
  const [leftJson, setLeftJson] = useState('');
  const [rightJson, setRightJson] = useState('');
  const [leftFormatted, setLeftFormatted] = useState('');
  const [rightFormatted, setRightFormatted] = useState('');
  const [diffResults, setDiffResults] = useState<DiffResult[]>([]);
  const [hasDifferences, setHasDifferences] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [showInputs, setShowInputs] = useState(true);
  const [error, setError] = useState('');
  const { t, language } = useI18n();

  // 深度比较两个JSON对象
  const deepCompareJson = useCallback((left: any, right: any, path: string = ''): DiffResult[] => {
    const results: DiffResult[] = [];
    
    // 处理null和undefined
    if (left === null && right === null) {
      results.push({ type: 'unchanged', path, leftValue: left, rightValue: right });
      return results;
    }
    
    if (left === null || left === undefined) {
      results.push({ type: 'added', path, rightValue: right });
      return results;
    }
    
    if (right === null || right === undefined) {
      results.push({ type: 'removed', path, leftValue: left });
      return results;
    }
    
    // 处理基本类型
    if (typeof left !== 'object' || typeof right !== 'object') {
      if (left === right) {
        results.push({ type: 'unchanged', path, leftValue: left, rightValue: right });
      } else {
        results.push({ type: 'modified', path, leftValue: left, rightValue: right });
      }
      return results;
    }
    
    // 处理数组
    if (Array.isArray(left) && Array.isArray(right)) {
      const maxLength = Math.max(left.length, right.length);
      const children: DiffResult[] = [];
      
      for (let i = 0; i < maxLength; i++) {
        const currentPath = path ? `${path}[${i}]` : `[${i}]`;
        if (i >= left.length) {
          children.push(...deepCompareJson(undefined, right[i], currentPath));
        } else if (i >= right.length) {
          children.push(...deepCompareJson(left[i], undefined, currentPath));
        } else {
          children.push(...deepCompareJson(left[i], right[i], currentPath));
        }
      }
      
      const hasChanges = children.some(child => child.type !== 'unchanged');
      results.push({
        type: hasChanges ? 'modified' : 'unchanged',
        path,
        leftValue: left,
        rightValue: right,
        children
      });
      
      return results;
    }
    
    // 处理对象
    if (Array.isArray(left) || Array.isArray(right)) {
      // 一个是数组，一个不是
      results.push({ type: 'modified', path, leftValue: left, rightValue: right });
      return results;
    }
    
    // 两个都是对象
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    const allKeys = new Set([...leftKeys, ...rightKeys]);
    const children: DiffResult[] = [];
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      if (!(key in left)) {
        children.push(...deepCompareJson(undefined, right[key], currentPath));
      } else if (!(key in right)) {
        children.push(...deepCompareJson(left[key], undefined, currentPath));
      } else {
        children.push(...deepCompareJson(left[key], right[key], currentPath));
      }
    }
    
    const hasChanges = children.some(child => child.type !== 'unchanged');
    results.push({
      type: hasChanges ? 'modified' : 'unchanged',
      path,
      leftValue: left,
      rightValue: right,
      children
    });
    
    return results;
  }, []);

  const formatAndCompare = useCallback(() => {
    try {
      setError('');
      
      // 解析JSON
      let leftParsed: any = null;
      let rightParsed: any = null;
      
      if (leftJson.trim()) {
        leftParsed = JSON.parse(leftJson);
      }
      
      if (rightJson.trim()) {
        rightParsed = JSON.parse(rightJson);
      }
      
      // 格式化JSON用于显示
      const leftFormatted = leftParsed ? JSON.stringify(leftParsed, null, 2) : '';
      const rightFormatted = rightParsed ? JSON.stringify(rightParsed, null, 2) : '';
      
      setLeftFormatted(leftFormatted);
      setRightFormatted(rightFormatted);
      
      // 执行深度比较
      if (leftParsed !== null || rightParsed !== null) {
        const diffResults = deepCompareJson(leftParsed, rightParsed);
        setDiffResults(diffResults);
        
        // 检查是否有差异
        const hasDiff = diffResults.some(result => result.type !== 'unchanged');
        setHasDifferences(hasDiff);
      } else {
        setDiffResults([]);
        setHasDifferences(false);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '无效的JSON格式');
      setDiffResults([]);
      setHasDifferences(false);
    }
  }, [leftJson, rightJson, deepCompareJson]);

  // 过滤差异结果，只显示有差异的项目
  const filterDiffResults = (results: DiffResult[]): DiffResult[] => {
    return results.filter(result => {
      if (result.type !== 'unchanged') {
        return true;
      }
      // 如果是unchanged但有children，检查children是否有差异
      if (result.children && result.children.length > 0) {
        const filteredChildren = filterDiffResults(result.children);
        if (filteredChildren.length > 0) {
          return { ...result, children: filteredChildren };
        }
      }
      return false;
    }).map(result => {
      if (result.children && result.children.length > 0) {
        return { ...result, children: filterDiffResults(result.children) };
      }
      return result;
    });
  };

  // 渲染差异结果
  const renderDiffResult = useCallback((result: DiffResult, indent: number = 0): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    const indentStr = '  '.repeat(indent);
    
    if (result.type === 'unchanged' && showDiffOnly) {
      return elements;
    }
    
    const getColorClass = (type: string) => {
      switch (type) {
        case 'added': return 'bg-green-100 text-green-800 border-l-4 border-green-500';
        case 'removed': return 'bg-red-100 text-red-800 border-l-4 border-red-500';
        case 'modified': return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
        default: return 'text-bj-text-primary';
      }
    };
    
    const getTypeSymbol = (type: string) => {
      switch (type) {
        case 'added': return '+ ';
        case 'removed': return '- ';
        case 'modified': return '~ ';
        default: return '  ';
      }
    };
    
    if (result.children && result.children.length > 0) {
      // 有子元素的对象或数组
      if (result.type !== 'unchanged' || !showDiffOnly) {
        elements.push(
          <div key={`${result.path}-header`} className={`px-3 py-1 ${getColorClass(result.type)}`}>
            <span className="font-mono text-sm">
              {indentStr}{getTypeSymbol(result.type)}{result.path || 'root'}: {Array.isArray(result.leftValue || result.rightValue) ? '[' : '{'}
            </span>
          </div>
        );
      }
      
      // 渲染子元素
      result.children.forEach((child, index) => {
        elements.push(...renderDiffResult(child, indent + 1));
      });
      
      if (result.type !== 'unchanged' || !showDiffOnly) {
        elements.push(
          <div key={`${result.path}-footer`} className={`px-3 py-1 ${getColorClass(result.type)}`}>
            <span className="font-mono text-sm">
              {indentStr}{getTypeSymbol(result.type)}{Array.isArray(result.leftValue || result.rightValue) ? ']' : '}'}
            </span>
          </div>
        );
      }
    } else {
      // 叶子节点
      const leftVal = result.leftValue !== undefined ? JSON.stringify(result.leftValue) : '';
      const rightVal = result.rightValue !== undefined ? JSON.stringify(result.rightValue) : '';
      
      if (result.type === 'modified') {
        elements.push(
          <div key={`${result.path}-removed`} className="px-3 py-1 bg-red-100 text-red-800 border-l-4 border-red-500">
            <span className="font-mono text-sm">
              {indentStr}- {result.path}: {leftVal}
            </span>
          </div>
        );
        elements.push(
          <div key={`${result.path}-added`} className="px-3 py-1 bg-green-100 text-green-800 border-l-4 border-green-500">
            <span className="font-mono text-sm">
              {indentStr}+ {result.path}: {rightVal}
            </span>
          </div>
        );
      } else {
        const value = result.type === 'removed' ? leftVal : rightVal;
        elements.push(
          <div key={result.path} className={`px-3 py-1 ${getColorClass(result.type)}`}>
            <span className="font-mono text-sm">
              {indentStr}{getTypeSymbol(result.type)}{result.path}: {value}
            </span>
          </div>
        );
      }
    }
    
    return elements;
  }, [showDiffOnly]);

  const exportDiff = useCallback((format: 'html' | 'json') => {
    if (!leftFormatted && !rightFormatted) return;
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (format === 'json') {
      const diffData = {
        left: leftFormatted,
        right: rightFormatted,
        timestamp: new Date().toISOString(),
        viewMode,
        showDiffOnly
      };
      content = JSON.stringify(diffData, null, 2);
      filename = 'json-diff.json';
      mimeType = 'application/json';
    } else {
      // 简单的HTML导出
      content = `
<!DOCTYPE html>
<html>
<head>
    <title>JSON Diff Report</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        .container { display: flex; gap: 20px; }
        .panel { flex: 1; }
        .panel h3 { margin-top: 0; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>JSON Diff Report</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    <div class="container">
        <div class="panel">
            <h3>Left JSON</h3>
            <pre>${leftFormatted}</pre>
        </div>
        <div class="panel">
            <h3>Right JSON</h3>
            <pre>${rightFormatted}</pre>
        </div>
    </div>
</body>
</html>`;
      filename = 'json-diff.html';
      mimeType = 'text/html';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [leftFormatted, rightFormatted, viewMode, showDiffOnly]);

  const handleFileUpload = useCallback((side: 'left' | 'right') => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (side === 'left') {
            setLeftJson(content);
          } else {
            setRightJson(content);
          }
        };
        reader.readAsText(file);
      }
    };
  }, []);

  const clearAll = useCallback(() => {
    setLeftJson('');
    setRightJson('');
    setLeftFormatted('');
    setRightFormatted('');
    setError('');
  }, []);

  const copyResult = useCallback(async (side: 'left' | 'right') => {
    const content = side === 'left' ? leftFormatted : rightFormatted;
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  }, [leftFormatted, rightFormatted]);

  const copyToClipboard = useCallback(async (content: string) => {
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  }, []);

  const downloadJson = useCallback((content: string, filename: string) => {
    if (content) {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, []);

  const getDiffText = useCallback(() => {
    if (diffResults.length > 0) {
      // 返回差异结果的文本格式
      const diffText = diffResults.map(result => {
        const formatDiffResult = (result: DiffResult, indent = 0): string => {
          const prefix = '  '.repeat(indent);
          const symbol = result.type === 'added' ? '+' : result.type === 'removed' ? '-' : result.type === 'modified' ? '~' : ' ';
          
          if (result.children && result.children.length > 0) {
            const childrenText = result.children.map(child => formatDiffResult(child, indent + 1)).join('\n');
            return `${prefix}${symbol} ${result.path}:\n${childrenText}`;
          } else {
            if (result.type === 'modified') {
              return `${prefix}${symbol} ${result.path}: ${JSON.stringify(result.leftValue)} → ${JSON.stringify(result.rightValue)}`;
            } else {
              const value = result.type === 'removed' ? result.leftValue : result.rightValue;
              return `${prefix}${symbol} ${result.path}: ${JSON.stringify(value)}`;
            }
          }
        };
        return formatDiffResult(result);
      }).join('\n');
      
      return `JSON差异对比结果:\n${diffText}`;
    } else {
      const diffData = {
        left: leftFormatted,
        right: rightFormatted,
        timestamp: new Date().toISOString(),
        viewMode,
        showDiffOnly
      };
      return JSON.stringify(diffData, null, 2);
    }
  }, [leftFormatted, rightFormatted, viewMode, showDiffOnly, diffResults])

  return (
    <div className="min-h-screen bg-bj-bg-primary">
      <SEO
        page="diff"
        title={t.seo.diff.title}
        description={t.seo.diff.description}
        keywords={t.seo.diff.keywords}
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header with title and controls */}
        <header className="bg-white rounded-lg shadow-sm border border-bj-border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
               <GitCompare className="w-5 h-5 text-bj-accent-blue" />
               <h1 className="text-lg font-semibold text-bj-text-primary">JSON 对比工具</h1>
             </div>
            
            <div className="flex items-center space-x-2">
              <button
                 onClick={formatAndCompare}
                 disabled={!leftJson.trim() || !rightJson.trim()}
                 className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed text-white text-xs rounded transition-all duration-200 flex items-center space-x-1.5"
               >
                 <GitCompare className="w-3.5 h-3.5" />
                 <span>{t.diff.compareButton}</span>
               </button>
              
              <div className="flex items-center space-x-1">
                 <label className="text-bj-text-secondary text-xs">
                   视图模式:
                 </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as ViewMode)}
                  className="px-2 py-1 bg-white border border-bj-border text-bj-text-primary text-xs rounded focus:outline-none focus:ring-1 focus:ring-bj-accent-blue/20 focus:border-bj-accent-blue transition-all duration-200"
                >
                  <option value="split">分屏视图</option>
                   <option value="unified">统一视图</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowDiffOnly(!showDiffOnly)}
                disabled={!hasDifferences}
                className={`px-3 py-1.5 text-xs rounded transition-all duration-200 flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  showDiffOnly 
                    ? 'bg-bj-accent-orange hover:bg-bj-accent-orange-hover text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{showDiffOnly ? '显示全部' : '仅差异'}</span>
              </button>
              
              <button
                onClick={() => setShowInputs(!showInputs)}
                className={`px-3 py-1.5 text-xs rounded transition-all duration-200 flex items-center space-x-1.5 ${
                   showInputs 
                     ? 'bg-bj-accent-green hover:bg-bj-accent-green-hover text-white' 
                     : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                 }`}
               >
                 <Eye className="w-3.5 h-3.5" />
                 <span>{showInputs ? '隐藏输入' : '显示输入'}</span>
               </button>
              
              <button
                onClick={() => exportDiff('json')}
                disabled={!leftFormatted && !rightFormatted}
                className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed text-white text-xs rounded transition-all duration-200 flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出JSON</span>
              </button>
              
              <button
                onClick={() => exportDiff('html')}
                disabled={!leftFormatted && !rightFormatted}
                className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed text-white text-xs rounded transition-all duration-200 flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>导出HTML</span>
              </button>
              
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-all duration-200 flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                 <span>清空</span>
              </button>
            </div>
          </div>
        </header>

        {/* 错误提示 */}
        {error && (
          <div className="bg-bj-error/10 border border-bj-error/20 rounded-lg p-4 mb-6">
            <div className="text-bj-error text-sm">
              <strong>{language === 'zh' ? '错误:' : 'Error:'}</strong> {error}
            </div>
          </div>
        )}

        {/* 编辑器容器 */}
        {showInputs && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 transition-all duration-300 ease-in-out" aria-label={t.diff.leftLabel}>
          {/* 左侧编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border border-bj-border overflow-hidden">
            <div className="bg-bj-bg-secondary border-b border-bj-border px-3 py-2 flex items-center justify-between">
              <h3 className="text-bj-text-primary text-sm font-medium">{t.diff.leftLabel}</h3>
              <div className="flex items-center space-x-1.5">
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileUpload('left')}
                  className="hidden"
                  id="left-file-upload"
                />
                <label
                  htmlFor="left-file-upload"
                  className="p-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary border border-bj-border text-bj-text-primary rounded cursor-pointer transition-all duration-200 flex items-center"
                  title={language === 'zh' ? '上传文件' : 'Upload File'}
                >
                  <Upload className="w-3.5 h-3.5" />
                </label>
                <button
                  onClick={() => copyToClipboard(leftJson)}
                  disabled={!leftJson}
                  className="p-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed border border-bj-border text-bj-text-primary rounded transition-all duration-200 flex items-center"
                  title={t.formatter.copyButton}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => downloadJson(leftJson, 'json1.json')}
                  disabled={!leftJson}
                  className="p-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed border border-bj-border text-bj-text-primary rounded transition-all duration-200 flex items-center"
                  title="下载"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-2 sm:p-6">
              <Editor
                height="400px"
                defaultLanguage="json"
                value={leftJson}
                onChange={(value) => setLeftJson(value || '')}
                theme="vs"
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  placeholder: t.diff.leftPlaceholder,
                }}
              />
            </div>
          </div>

          {/* 右侧编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border border-bj-border overflow-hidden">
            <div className="bg-bj-bg-secondary border-b border-bj-border px-3 py-2 flex items-center justify-between">
              <h3 className="text-bj-text-primary text-sm font-medium">{t.diff.rightLabel}</h3>
              <div className="flex items-center space-x-1.5">
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileUpload('right')}
                  className="hidden"
                  id="right-file-upload"
                />
                <label
                  htmlFor="right-file-upload"
                  className="p-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary border border-bj-border text-bj-text-primary rounded cursor-pointer transition-all duration-200 flex items-center"
                  title="上传文件"
                >
                  <Upload className="w-3.5 h-3.5" />
                </label>
                <button
                  onClick={() => copyToClipboard(rightJson)}
                  disabled={!rightJson}
                  className="p-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed border border-bj-border text-bj-text-primary rounded transition-all duration-200 flex items-center"
                  title="复制"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => downloadJson(rightJson, 'json2.json')}
                  disabled={!rightJson}
                  className="p-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed border border-bj-border text-bj-text-primary rounded transition-all duration-200 flex items-center"
                  title="下载"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-2 sm:p-6">
              <Editor
                height="400px"
                defaultLanguage="json"
                value={rightJson}
                onChange={(value) => setRightJson(value || '')}
                theme="vs"
                options={{
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  placeholder: t.diff.rightPlaceholder,
                }}
              />
            </div>
          </div>
        </section>
        )}

        {/* 对比结果 */}
        {(leftFormatted || rightFormatted) && (
          <section className="bg-white rounded-lg shadow-sm border border-bj-border p-3 sm:p-4" aria-label="对比结果">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h3 className="text-sm font-medium text-bj-text-primary">对比结果</h3>
                {diffResults.length > 0 && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    hasDifferences 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {hasDifferences ? t.diff.differencesFound : t.diff.noDifference}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1.5">
                {diffResults.length > 0 && hasDifferences && (
                  <button
                    onClick={() => setShowDiffOnly(!showDiffOnly)}
                    className={`px-3 py-1.5 text-xs rounded transition-all duration-200 flex items-center space-x-1.5 shadow-sm hover:shadow ${
                      showDiffOnly 
                        ? 'bg-bj-accent-orange hover:bg-bj-accent-orange-hover text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>{showDiffOnly ? '显示全部' : '仅显示差异'}</span>
                  </button>
                )}
                <button
                  onClick={() => copyToClipboard(getDiffText())}
                  className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover text-white text-xs rounded transition-all duration-200 flex items-center space-x-1.5 shadow-sm hover:shadow"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制差异</span>
                </button>
              </div>
            </div>
            
            {/* 差异显示 */}
            {diffResults.length > 0 ? (
              <div className="border border-bj-border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-auto">
                  {(showDiffOnly ? filterDiffResults(diffResults) : diffResults).map((result, index) => (
                    <div key={index}>
                      {renderDiffResult(result)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                {viewMode === 'split' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-bj-text-primary text-sm font-medium mb-3">左侧 JSON</h4>
                      <pre className="bg-bj-bg-primary border border-bj-border rounded-lg p-4 text-sm text-bj-text-primary overflow-auto max-h-96 font-mono whitespace-pre-wrap">
                        {leftFormatted}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-bj-text-primary text-sm font-medium mb-3">右侧 JSON</h4>
                      <pre className="bg-bj-bg-primary border border-bj-border rounded-lg p-4 text-sm text-bj-text-primary overflow-auto max-h-96 font-mono whitespace-pre-wrap">
                        {rightFormatted}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-bj-text-primary text-sm font-medium mb-3">统一对比视图</h4>
                    <pre className="bg-bj-bg-primary border border-bj-border rounded-lg p-4 text-sm text-bj-text-primary overflow-auto max-h-96 font-mono whitespace-pre-wrap">
                      {`${leftFormatted}\n\n--- 分隔线 ---\n\n${rightFormatted}`}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Diff;