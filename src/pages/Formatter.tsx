import React, { useState, useCallback, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Settings, Copy, Upload, Download, RotateCcw, Maximize, Minimize } from 'lucide-react';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';
import { useJsonStore } from '@/store/jsonStore';
import type { HistoryRecord } from '@/store/jsonStore';
import { useI18n } from '../hooks/useI18n';

const Formatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const { t, language } = useI18n();

  const { addToHistory, clearHistory, history } = useJsonStore();
  const [editorHeight, setEditorHeight] = useState(600);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);
      setInput(formatted);
      setError('');
      
      // 添加到历史记录
      addToHistory({
        type: 'format',
        input,
        output: formatted,
        timestamp: new Date(),
        settings: { indent }
      });
    } catch (err) {
      setError(t.formatter.formatError);
    }
  }, [input, indent, addToHistory]);

  const minifyJson = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      setError('');
      
      // 添加到历史记录
      addToHistory({
        type: 'minify',
        input,
        output: minified,
        timestamp: new Date(),
        settings: { indent }
      });
    } catch (err) {
      setError(t.formatter.formatError);
    }
  }, [input, indent, addToHistory, t.formatter.formatError]);

  const escapeJson = useCallback(() => {
    try {
      const escaped = JSON.stringify(input);
      setInput(escaped);
      setError('');
    } catch (err) {
      setError(t.formatter.copyError);
    }
  }, [input, t.formatter.copyError]);

  const unescapeJson = useCallback(() => {
    try {
      const unescaped = JSON.parse(input);
      if (typeof unescaped === 'string') {
        setInput(unescaped);
        setError('');
      } else {
        setError(t.formatter.formatError);
      }
    } catch (err) {
      setError(t.formatter.formatError);
    }
  }, [input, t.formatter.formatError]);

  const copyToClipboard = useCallback(async () => {
    if (input) {
      try {
        await navigator.clipboard.writeText(input);
        // 这里可以添加成功提示
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  }, [input]);

  const downloadJson = useCallback(() => {
    if (input) {
      const blob = new Blob([input], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'formatted.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [input]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  }, []);

  const clearAll = useCallback(() => {
    setInput('');
    setError('');
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const rect = document.querySelector('.editor-container')?.getBoundingClientRect();
      if (rect) {
        const newHeight = Math.max(300, Math.min(800, e.clientY - rect.top - 100));
        setEditorHeight(newHeight);
      }
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // 键盘快捷键支持 (F11 或 Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, toggleFullscreen]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={`min-h-screen bg-bj-bg-primary ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <SEO
        page="formatter"
        title={t.seo.formatter.title}
        description={t.seo.formatter.description}
        keywords={t.seo.formatter.keywords}
      />
      {!isFullscreen && <Navigation />}
      <main className={`${isFullscreen ? 'h-screen p-4' : 'container mx-auto px-6 py-6'}`}>
        <div className={`${isFullscreen ? 'h-full' : 'max-w-7xl mx-auto'}`}>
          <div className={`${isFullscreen ? 'h-full' : 'grid grid-cols-1 lg:grid-cols-4 gap-4'}`}>
            {/* 左侧编辑器 */}
            <section className={`${isFullscreen ? 'h-full' : 'lg:col-span-3'}`} aria-label={t.formatter.title}>
              <div className={`bg-white ${isFullscreen ? 'h-full' : 'rounded-lg'} shadow-sm border border-bj-border ${isFullscreen ? 'flex flex-col' : ''}`}>
                <div className="px-4 py-3 border-b border-bj-border bg-bj-bg-secondary/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <label className="text-xs text-bj-text-secondary font-medium">
                        {t.formatter.inputPlaceholder.includes('缩进') ? '缩进:' : 'Indent:'}
                        <select
                          value={indent}
                          onChange={(e) => setIndent(Number(e.target.value))}
                          className="ml-2 px-2 py-1 border border-bj-border rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-bj-accent-blue"
                        >
                          <option value={2}>{language === 'zh' ? '2 空格' : '2 spaces'}</option>
                          <option value={4}>{language === 'zh' ? '4 空格' : '4 spaces'}</option>
                          <option value={8}>{language === 'zh' ? '8 空格' : '8 spaces'}</option>
                        </select>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={formatJson}
                        className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover text-white rounded text-xs flex items-center space-x-1.5 transition-all duration-200 shadow-sm hover:shadow"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>{t.formatter.formatButton}</span>
                      </button>
                      
                      <button
                        onClick={minifyJson}
                        className="px-3 py-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary text-bj-text-primary border border-bj-border rounded text-xs transition-all duration-200"
                      >
                        {t.formatter.compressButton}
                      </button>
                      
                      <button
                        onClick={escapeJson}
                        className="px-3 py-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary text-bj-text-primary border border-bj-border rounded text-xs transition-all duration-200"
                      >
                        {t.formatter.escapeButton}
                      </button>
                      
                      <button
                        onClick={unescapeJson}
                        className="px-3 py-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary text-bj-text-primary border border-bj-border rounded text-xs transition-all duration-200"
                      >
                        {language === 'zh' ? '去除转义' : 'Unescape'}
                      </button>
                      
                      <button
                        onClick={clearAll}
                        className="px-3 py-1.5 bg-bj-text-muted hover:bg-bj-text-secondary text-white rounded text-xs flex items-center space-x-1.5 transition-all duration-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.formatter.clearButton}</span>
                      </button>
                      
                      <button
                        onClick={toggleFullscreen}
                        className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover text-white rounded text-xs flex items-center space-x-1.5 transition-all duration-200"
                        title={isFullscreen ? (language === 'zh' ? '退出全屏 (Esc)' : 'Exit Fullscreen (Esc)') : (language === 'zh' ? '全屏 (F11)' : 'Fullscreen (F11)')}
                      >
                        {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                        <span>{isFullscreen ? (language === 'zh' ? '退出全屏' : 'Exit') : (language === 'zh' ? '全屏' : 'Fullscreen')}</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".json,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="px-3 py-1.5 bg-bj-bg-secondary hover:bg-bj-bg-tertiary text-bj-text-primary border border-bj-border rounded text-xs cursor-pointer flex items-center space-x-1.5 transition-all duration-200"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{language === 'zh' ? '上传文件' : 'Upload File'}</span>
                      </label>
                      
                      <button
                        onClick={copyToClipboard}
                        disabled={!input}
                        className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed text-white rounded text-xs flex items-center space-x-1.5 transition-all duration-200 disabled:hover:scale-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.formatter.copyButton}</span>
                      </button>
                      
                      <button
                        onClick={downloadJson}
                        disabled={!input}
                        className="px-3 py-1.5 bg-bj-accent-blue hover:bg-bj-accent-blue-hover disabled:bg-bj-text-muted/30 disabled:cursor-not-allowed text-white rounded text-xs flex items-center space-x-1.5 transition-all duration-200 disabled:hover:scale-100"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{language === 'zh' ? '下载' : 'Download'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="mx-4 mt-3 bg-bj-error/10 border border-bj-error/20 rounded p-3">
                    <div className="text-bj-error text-xs">
                      <strong>{language === 'zh' ? '错误:' : 'Error:'}</strong> {error}
                    </div>
                  </div>
                )}

                <div className={`${isFullscreen ? 'flex-1 flex flex-col' : 'p-3'}`}>
                  <div className={`${isFullscreen ? 'flex-1' : 'relative'}`}>
                    <div 
                      className={`${isFullscreen ? 'h-full' : 'resize-y overflow-hidden border border-bj-border rounded'}`}
                      style={isFullscreen ? {} : { minHeight: '300px', maxHeight: '800px', height: `${editorHeight}px` }}
                    >
                      <Editor
                        height={isFullscreen ? '100%' : `${editorHeight}px`}
                        defaultLanguage="json"
                        theme="vs"
                        value={input}
                        onChange={(value) => setInput(value || '')}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: isFullscreen ? 16 : 14,
                          lineNumbers: 'on',
                          wordWrap: 'on',
                          automaticLayout: true,
                          tabSize: 2,
                          insertSpaces: true,
                          placeholder: t.formatter.inputPlaceholder,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 右侧历史记录 */}
            {!isFullscreen && (
              <aside className="lg:col-span-1" aria-label={t.formatter.historyTitle}>
              <div className="bg-white rounded-lg shadow-sm border border-bj-border">
                <div className="px-4 py-3 border-b border-bj-border bg-bj-bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-bj-text-primary">{t.formatter.historyTitle}</h3>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-bj-text-muted hover:text-bj-text-secondary transition-colors px-2 py-1 rounded hover:bg-bj-bg-secondary"
                    >
                      {t.formatter.clearHistory}
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.length === 0 ? (
                      <p className="text-xs text-bj-text-muted text-center py-6">{t.formatter.noHistory}</p>
                    ) : (
                      history.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 border border-bj-border rounded hover:bg-bj-bg-secondary cursor-pointer transition-colors"
                          onClick={() => setInput(item.output)}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-xs text-bj-text-muted">{item.timestamp.toLocaleString()}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-bj-bg-tertiary text-bj-text-secondary rounded">
                              {item.type}
                            </span>
                          </div>
                          <div className="text-xs text-bj-text-primary font-mono truncate">
                            {item.output.substring(0, 50)}...
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Formatter;