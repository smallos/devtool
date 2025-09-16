import React, { useState, useCallback, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Settings, Copy, Upload, Download, RotateCcw, Maximize, Minimize, History, Code, GripHorizontal } from 'lucide-react';
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
  const [editorWidth, setEditorWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);
  const [isWidthDragging, setIsWidthDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');

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

  // 拖拽调整高度
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 拖拽调整宽度
  const handleWidthMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWidthDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newHeight = Math.max(200, Math.min(800, e.clientY - 200));
      setEditorHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const handleWidthMouseMove = (e: MouseEvent) => {
      if (!isWidthDragging) return;
      
      const containerRect = document.querySelector('.container')?.getBoundingClientRect();
      if (containerRect) {
        const newWidth = Math.max(400, Math.min(1200, e.clientX - containerRect.left - 32));
        setEditorWidth(newWidth);
      }
    };

    const handleWidthMouseUp = () => {
      setIsWidthDragging(false);
    };

    if (isWidthDragging) {
      document.addEventListener('mousemove', handleWidthMouseMove);
      document.addEventListener('mouseup', handleWidthMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleWidthMouseMove);
      document.removeEventListener('mouseup', handleWidthMouseUp);
    };
  }, [isWidthDragging]);

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



  return (
    <div className={`min-h-screen bg-bj-bg-primary ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <SEO
        page="formatter"
        title={t.seo.formatter.title}
        description={t.seo.formatter.description}
        keywords={t.seo.formatter.keywords}
      />
      
      {/* Header with function buttons */}
      {!isFullscreen && (
        <div className="bg-white border-b border-bj-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-bj-text-primary">{t.formatter.title}</h1>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-bj-text-secondary font-medium">
                    {t.formatter.inputPlaceholder.includes('缩进') ? '缩进:' : 'Indent:'}
                    <select
                      value={indent}
                      onChange={(e) => setIndent(Number(e.target.value))}
                      className="ml-2 px-2 py-1 border border-bj-border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-bj-accent-blue/20"
                    >
                      <option value={2}>{language === 'zh' ? '2 空格' : '2 spaces'}</option>
                      <option value={4}>{language === 'zh' ? '4 空格' : '4 spaces'}</option>
                      <option value={8}>{language === 'zh' ? '8 空格' : '8 spaces'}</option>
                    </select>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto">
                <button
                  onClick={formatJson}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-white bg-blue-500 border border-blue-500 rounded-lg hover:bg-blue-600 hover:border-blue-600 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.formatter.formatButton}</span>
                </button>
                
                <button
                  onClick={minifyJson}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">{t.formatter.compressButton}</span>
                  <span className="sm:hidden">压缩</span>
                </button>
                
                <button
                  onClick={escapeJson}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">{t.formatter.escapeButton}</span>
                  <span className="sm:hidden">转义</span>
                </button>
                
                <button
                  onClick={unescapeJson}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">{language === 'zh' ? '去除转义' : 'Unescape'}</span>
                  <span className="sm:hidden">去转义</span>
                </button>
                
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'zh' ? '上传' : 'Upload'}</span>
                </label>
                
                <button
                  onClick={copyToClipboard}
                  disabled={!input}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:shadow-none whitespace-nowrap"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.formatter.copyButton}</span>
                </button>
                
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-700 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.formatter.clearButton}</span>
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-white bg-blue-500 border border-blue-500 rounded-lg hover:bg-blue-600 hover:border-blue-600 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
                  title={isFullscreen ? (language === 'zh' ? '退出全屏 (Esc)' : 'Exit Fullscreen (Esc)') : (language === 'zh' ? '全屏 (F11)' : 'Fullscreen (F11)')}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isFullscreen ? (language === 'zh' ? '退出全屏' : 'Exit') : (language === 'zh' ? '全屏' : 'Fullscreen')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className={`${isFullscreen ? 'h-screen p-4' : 'container mx-auto px-6 py-6'}`}>
        <div className={`${isFullscreen ? 'h-full' : 'max-w-7xl mx-auto'}`}>
          <div className={`${isFullscreen ? 'h-full' : 'flex justify-center'}`}>
            {/* 编辑器容器 */}
            <section className={`${isFullscreen ? 'h-full w-full' : 'editor-container'}`} aria-label={t.formatter.title} style={isFullscreen ? {} : { width: `${editorWidth}px` }}>
              <div className={`bg-white ${isFullscreen ? 'h-full' : 'rounded-lg'} shadow-sm border border-bj-border ${isFullscreen ? 'flex flex-col' : ''} relative`}>
                {/* 标签页导航 */}
                <div className="flex border-b border-bj-border bg-bj-bg-secondary/30">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                      activeTab === 'editor'
                        ? 'border-bj-accent-blue text-bj-accent-blue bg-white'
                        : 'border-transparent text-bj-text-secondary hover:text-bj-text-primary hover:bg-bj-bg-secondary'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>{language === 'zh' ? '编辑器' : 'Editor'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                      activeTab === 'history'
                        ? 'border-bj-accent-blue text-bj-accent-blue bg-white'
                        : 'border-transparent text-bj-text-secondary hover:text-bj-text-primary hover:bg-bj-bg-secondary'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>{t.formatter.historyTitle} ({history.length})</span>
                  </button>
                </div>



                {/* 错误提示 */}
                {activeTab === 'editor' && error && (
                  <div className="mx-4 mt-3 bg-bj-error/10 border border-bj-error/20 rounded p-3">
                    <div className="text-bj-error text-xs">
                      <strong>{language === 'zh' ? '错误:' : 'Error:'}</strong> {error}
                    </div>
                  </div>
                )}

                {/* 内容区域 */}
                <div className={`${isFullscreen ? 'flex-1 flex flex-col' : 'p-3'} relative`}>
                  {activeTab === 'editor' ? (
                    <div className={`${isFullscreen ? 'flex-1' : 'relative'}`}>
                      <div 
                        className={`${isFullscreen ? 'h-full' : 'border border-bj-border rounded'}`}
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
                      {/* 高度调整拖拽条 */}
                      {!isFullscreen && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-bj-accent-blue/20 transition-colors flex items-center justify-center"
                          onMouseDown={handleMouseDown}
                        >
                          <GripHorizontal className="w-4 h-4 text-bj-text-muted" />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 历史记录面板 */
                    <div className={`${isFullscreen ? 'flex-1' : ''}`} style={isFullscreen ? {} : { height: `${editorHeight}px` }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-bj-text-primary">{t.formatter.historyTitle}</h3>
                        <button
                          onClick={clearHistory}
                          className="text-xs text-bj-text-muted hover:text-bj-text-secondary transition-colors px-2 py-1 rounded hover:bg-bj-bg-secondary"
                        >
                          {t.formatter.clearHistory}
                        </button>
                      </div>
                      <div className="space-y-2 overflow-y-auto" style={{ height: isFullscreen ? 'calc(100% - 60px)' : `${editorHeight - 60}px` }}>
                        {history.length === 0 ? (
                          <p className="text-xs text-bj-text-muted text-center py-6">{t.formatter.noHistory}</p>
                        ) : (
                          history.map((item) => (
                            <div
                              key={item.id}
                              className="p-2.5 border border-bj-border rounded hover:bg-bj-bg-secondary cursor-pointer transition-colors"
                              onClick={() => {
                                setInput(item.output);
                                setActiveTab('editor');
                              }}
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
                  )}
                </div>

                {/* 宽度调整拖拽条 */}
                {!isFullscreen && (
                  <div
                    className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize bg-transparent hover:bg-bj-accent-blue/20 transition-colors flex items-center justify-center"
                    onMouseDown={handleWidthMouseDown}
                  >
                    <div className="w-1 h-8 bg-bj-text-muted/30 rounded-full" />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Formatter;