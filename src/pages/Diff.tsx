import React, { useState, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { Copy, Upload, Download, RotateCcw, Eye, EyeOff } from 'lucide-react';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';

type ViewMode = 'split' | 'unified';

const Diff: React.FC = () => {
  const [leftJson, setLeftJson] = useState('');
  const [rightJson, setRightJson] = useState('');
  const [leftFormatted, setLeftFormatted] = useState('');
  const [rightFormatted, setRightFormatted] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [error, setError] = useState('');

  const formatAndCompare = useCallback(() => {
    try {
      setError('');
      
      // 格式化左侧JSON
      let leftParsed = '';
      if (leftJson.trim()) {
        const parsedLeft = JSON.parse(leftJson);
        leftParsed = JSON.stringify(parsedLeft, null, 2);
      }
      
      // 格式化右侧JSON
      let rightParsed = '';
      if (rightJson.trim()) {
        const parsedRight = JSON.parse(rightJson);
        rightParsed = JSON.stringify(parsedRight, null, 2);
      }
      
      setLeftFormatted(leftParsed);
      setRightFormatted(rightParsed);
      
      // 历史记录功能暂时移除
    } catch (err) {
      setError(err instanceof Error ? err.message : '无效的JSON格式');
    }
  }, [leftJson, rightJson, viewMode, showDiffOnly]);

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
    const diffData = {
      left: leftFormatted,
      right: rightFormatted,
      timestamp: new Date().toISOString(),
      viewMode,
      showDiffOnly
    };
    return JSON.stringify(diffData, null, 2);
  }, [leftFormatted, rightFormatted, viewMode, showDiffOnly]);

  return (
    <div className="min-h-screen bg-bj-bg-primary">
      <SEO 
        title="JSON对比工具 - 在线JSON差异对比分析"
        description="专业的JSON对比工具，支持JSON文件差异分析、格式化对比、导出对比结果等功能"
        keywords="JSON对比,JSON差异,JSON比较,JSON分析,在线对比工具"
      />
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* 工具栏 */}
        <header className="bg-white rounded-lg shadow-sm border border-bj-border px-4 sm:px-6 py-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3 sm:gap-0">
              <button
                onClick={formatAndCompare}
                className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover text-white rounded text-xs flex items-center justify-center space-x-1.5 transition-all duration-200 shadow-sm hover:shadow"
              >
                <span>格式化并对比</span>
              </button>
              
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-bj-text-muted hover:bg-bj-text-secondary text-white rounded text-xs flex items-center justify-center space-x-1.5 transition-all duration-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>清空</span>
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-6 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-3 sm:gap-0">
                <label className="text-xs text-bj-text-secondary font-medium">视图模式:</label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as ViewMode)}
                  className="px-2 py-1 border border-bj-border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-bj-accent-blue"
                >
                  <option value="split">分屏</option>
                  <option value="unified">统一</option>
                </select>
              </div>
              
              <button
                onClick={() => setShowDiffOnly(!showDiffOnly)}
                className={`px-3 py-1.5 rounded text-xs transition-all duration-200 flex items-center justify-center space-x-1.5 ${
                  showDiffOnly
                    ? 'bg-bj-accent-blue/10 text-bj-accent-blue border border-bj-accent-blue/30'
                    : 'bg-bj-bg-secondary hover:bg-bj-bg-tertiary text-bj-text-primary border border-bj-border'
                }`}
              >
                {showDiffOnly ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showDiffOnly ? '显示全部' : '仅差异'}</span>
              </button>
            </div>
            
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3 sm:gap-0">
                <button
                  onClick={() => exportDiff('json')}
                  disabled={!leftFormatted && !rightFormatted}
                  className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed text-white text-xs rounded transition-all duration-200 flex items-center justify-center space-x-1.5 disabled:hover:scale-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出JSON</span>
                </button>
                
                <button
                  onClick={() => exportDiff('html')}
                  disabled={!leftFormatted && !rightFormatted}
                  className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed text-white text-xs rounded transition-all duration-200 flex items-center justify-center space-x-1.5 disabled:hover:scale-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出HTML</span>
                </button>
              </div>
          </div>
        </header>

        {/* 错误提示 */}
        {error && (
          <div className="bg-bj-error/10 border border-bj-error/20 rounded-lg p-4 mb-6">
            <div className="text-bj-error text-sm">
              <strong>错误:</strong> {error}
            </div>
          </div>
        )}

        {/* 编辑器容器 */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" aria-label="JSON编辑器">
          {/* 左侧编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border border-bj-border overflow-hidden">
            <div className="bg-bj-bg-secondary border-b border-bj-border px-3 py-2 flex items-center justify-between">
              <h3 className="text-bj-text-primary text-sm font-medium">JSON 1</h3>
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
                  title="上传文件"
                >
                  <Upload className="w-3.5 h-3.5" />
                </label>
                <button
                  onClick={() => copyToClipboard(leftJson)}
                  disabled={!leftJson}
                  className="p-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed border border-bj-border text-bj-text-primary rounded transition-all duration-200 flex items-center"
                  title="复制"
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
                }}
              />
            </div>
          </div>

          {/* 右侧编辑器 */}
          <div className="bg-white rounded-lg shadow-sm border border-bj-border overflow-hidden">
            <div className="bg-bj-bg-secondary border-b border-bj-border px-3 py-2 flex items-center justify-between">
              <h3 className="text-bj-text-primary text-sm font-medium">JSON 2</h3>
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
                }}
              />
            </div>
          </div>
        </section>

        {/* 对比结果 */}
        {(leftFormatted || rightFormatted) && (
          <section className="bg-white rounded-lg shadow-sm border border-bj-border p-3 sm:p-4" aria-label="对比结果">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-bj-text-primary">对比结果</h3>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => copyToClipboard(getDiffText())}
                  className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover text-white text-xs rounded transition-all duration-200 flex items-center space-x-1.5 shadow-sm hover:shadow"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制差异</span>
                </button>
              </div>
            </div>
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
          </section>
        )}
      </main>
    </div>
  );
};

export default Diff;