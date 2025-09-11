import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n';
import Navigation from '../components/Navigation';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { 
  Eye, EyeOff, Copy, Download, Upload, RotateCcw, Image, 
  ZoomIn, ZoomOut, Move, X, Edit, Code, ChevronUp, ChevronDown, Layers, History, Activity,
  Maximize2, Minimize2
} from 'lucide-react';

interface HistoryItem {
  id: string;
  name: string;
  code: string;
  timestamp: number;
}

const StateDiagram: React.FC = () => {
  const { t } = useI18n();

  // 添加CSS样式
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(156, 163, 175, 0.5);
        border-radius: 2px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(156, 163, 175, 0.8);
      }
      
      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(75, 85, 99, 0.5);
      }
      
      .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(75, 85, 99, 0.8);
      }
      
      /* 灰色点状网格背景 */
       .dot-grid-background {
         background-image: radial-gradient(circle, #d1d5db 1px, transparent 1px);
         background-size: 20px 20px;
         background-position: 0 0;
       }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [code, setCode] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [renderContent, setRenderContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string>('');
  
  // 悬浮面板状态
  const [isEditorVisible, setIsEditorVisible] = useState(true);
  const [isTemplateVisible, setIsTemplateVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: 20, y: 80 });
  const [editorSize, setEditorSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeEditorTab, setActiveEditorTab] = useState<'code' | 'templates' | 'history'>('code');
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const [editorResizeStart, setEditorResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<'se' | 'e' | 's' | null>(null);
  
  // 移除模板库抽屉相关状态
  
  // 移动端检测
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  
  // 图表交互状态
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const previewRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 默认状态图代码
  const defaultCode = `stateDiagram-v2
    [*] --> Idle
    Idle --> Active : start
    Active --> Idle : stop
    Active --> Error : fail
    Error --> Idle : reset
    Idle --> [*]`;

  // 模板列表
  const templates = useMemo(() => [
    {
      id: 'basic',
      name: t.stateDiagram.templates.basic,
      code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`
    },
    {
      id: 'userLogin',
      name: t.stateDiagram.templates.userLogin,
      code: `stateDiagram-v2
    [*] --> Login
    Login --> Authenticating
    Authenticating --> Success : Valid credentials
    Authenticating --> Failed : Invalid credentials
    Success --> Dashboard
    Failed --> Login
    Dashboard --> Logout
    Logout --> [*]`
    },
    {
      id: 'orderProcess',
      name: t.stateDiagram.templates.orderProcess,
      code: `stateDiagram-v2
    [*] --> Cart
    Cart --> Checkout
    Checkout --> Payment
    Payment --> Success : Payment OK
    Payment --> Failed : Payment Error
    Success --> Shipping
    Failed --> Checkout
    Shipping --> Delivered
    Delivered --> [*]`
    }
  ], [t]);

  // 初始化 Mermaid
  useEffect(() => {
    console.log('Initializing Mermaid...');
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      logLevel: 'debug',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true
      },
      state: {
        useMaxWidth: true
      }
    });
    console.log('Mermaid initialized successfully');
    
    // 设置默认代码
    setCode(defaultCode);
    
    // 加载历史记录
    loadHistory();
  }, []);

  // 组件挂载时渲染默认代码
  useEffect(() => {
    console.log('Component mounted, rendering default diagram');
    // 延迟一点确保DOM完全准备好
    const timer = setTimeout(() => {
      renderDiagram();
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // 渲染状态图
  const renderDiagram = async () => {
    if (!code.trim()) {
      console.log('Skipping render: no code');
      setRenderContent('');
      setRenderError('');
      return;
    }
    
    console.log('Starting diagram render with code:', code.substring(0, 50) + '...');
    setIsLoading(true);
    setRenderError('');
    
    try {
      // 生成唯一ID
      const diagramId = `mermaid-diagram-${Date.now()}`;
      console.log('Generated diagram ID:', diagramId);
      
      // 渲染Mermaid图表
      const { svg } = await mermaid.render(diagramId, code);
      console.log('Mermaid render successful, SVG length:', svg.length);
      
      // 使用React state管理渲染内容
      setRenderContent(svg);
      setRenderError('');
      
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      setRenderContent('');
      setRenderError(`渲染失败: ${error.message || '请检查语法是否正确'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 代码变化时重新渲染
  useEffect(() => {
    if (code.trim()) {
      const timer = setTimeout(() => {
        renderDiagram();
      }, 300);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code]);

  // 图表交互功能
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const handleResetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 触摸板双指手势支持
  const [lastTouchDistance, setLastTouchDistance] = useState<number>(0);
  const [lastTouchCenter, setLastTouchCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTouching, setIsTouching] = useState(false);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // 如果正在进行触摸操作，忽略滚轮事件
    if (isTouching) return;
    
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
    }
  }, [isTouching]);

  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: TouchList) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      // 停止任何正在进行的鼠标平移操作
      setIsPanning(false);
      setIsTouching(true);
      const distance = getTouchDistance(e.touches as any as TouchList);
      const center = getTouchCenter(e.touches as any as TouchList);
      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isTouching) {
      e.preventDefault();
      
      const currentDistance = getTouchDistance(e.touches as any as TouchList);
      const currentCenter = getTouchCenter(e.touches as any as TouchList);
      
      // 双指缩放
      if (lastTouchDistance > 0) {
        const scaleChange = currentDistance / lastTouchDistance;
        setScale(prev => Math.max(0.1, Math.min(3, prev * scaleChange)));
      }
      
      // 双指平移
      if (lastTouchCenter.x !== 0 && lastTouchCenter.y !== 0) {
        const deltaX = currentCenter.x - lastTouchCenter.x;
        const deltaY = currentCenter.y - lastTouchCenter.y;
        setPosition(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      }
      
      setLastTouchDistance(currentDistance);
      setLastTouchCenter(currentCenter);
    }
  }, [isTouching, lastTouchDistance, lastTouchCenter]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setIsTouching(false);
      setLastTouchDistance(0);
      setLastTouchCenter({ x: 0, y: 0 });
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 如果正在进行触摸操作，忽略鼠标事件
    if (isTouching) return;
    
    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  }, [position, isTouching]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // 如果正在进行触摸操作，忽略鼠标移动事件
    if (isTouching) return;
    
    if (isPanning) {
      setPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, panStart, isTouching]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // 悬浮面板拖拽功能
  const handleEditorMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - editorPosition.x,
        y: e.clientY - editorPosition.y
      });
      e.preventDefault();
    }
  }, [editorPosition]);

  // 编辑器大小调整处理
  const handleEditorResizeStart = (e: React.MouseEvent, direction: 'se' | 'e' | 's') => {
    setIsResizingEditor(true);
    setResizeDirection(direction);
    setEditorResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: editorSize.width,
      height: editorSize.height
    });
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理编辑器调整大小的鼠标事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingEditor && resizeDirection) {
        const deltaX = e.clientX - editorResizeStart.x;
        const deltaY = e.clientY - editorResizeStart.y;
        
        let newWidth = editorResizeStart.width;
        let newHeight = editorResizeStart.height;
        
        if (resizeDirection === 'se' || resizeDirection === 'e') {
          newWidth = Math.max(300, Math.min(800, editorResizeStart.width + deltaX));
        }
        if (resizeDirection === 'se' || resizeDirection === 's') {
          newHeight = Math.max(250, Math.min(600, editorResizeStart.height + deltaY));
        }
        
        setEditorSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      if (isResizingEditor) {
        setIsResizingEditor(false);
        setResizeDirection(null);
      }
    };

    if (isResizingEditor) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      const cursor = resizeDirection === 'se' ? 'nw-resize' : resizeDirection === 'e' ? 'ew-resize' : 'ns-resize';
      document.body.style.cursor = cursor;
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingEditor, resizeDirection, editorResizeStart]);

  // 移动端检测
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始调用

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleEditorMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setEditorPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleEditorMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 事件监听器
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleEditorMouseMove);
      document.addEventListener('mouseup', handleEditorMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleEditorMouseMove);
        document.removeEventListener('mouseup', handleEditorMouseUp);
      };
    }
  }, [isDragging, handleEditorMouseMove, handleEditorMouseUp]);

  // 加载历史记录
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('stateDiagram_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  // 保存到历史记录
  const saveToHistory = () => {
    if (!code.trim()) {
      toast.error(t.stateDiagram.errors.emptyCode);
      return;
    }

    const name = prompt(t.stateDiagram.prompts.saveName) || `Diagram ${Date.now()}`;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      name,
      code,
      timestamp: Date.now()
    };

    const updatedHistory = [newItem, ...history.slice(0, 9)];
    setHistory(updatedHistory);
    localStorage.setItem('stateDiagram_history', JSON.stringify(updatedHistory));
    toast.success(t.stateDiagram.messages.saved);
  };

  // 从历史记录加载
  const loadFromHistory = (item: HistoryItem) => {
    setCode(item.code);
    toast.success(t.stateDiagram.messages.loaded);
  };

  // 清除历史记录
  const clearHistory = () => {
    if (confirm(t.stateDiagram.prompts.clearHistory)) {
      setHistory([]);
      localStorage.removeItem('stateDiagram_history');
      toast.success(t.stateDiagram.messages.historyCleared);
    }
  };

  // 复制代码
  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success(t.stateDiagram.messages.copied);
  };

  // 导出为SVG
  const exportSVG = () => {
    if (!renderContent) {
      toast.error(t.stateDiagram.errors.noContent);
      return;
    }

    const blob = new Blob([renderContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'state-diagram.svg';
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success(t.stateDiagram.messages.exported);
  };

  // 导出为PNG（高质量）
  const exportPNG = async (customScale: number = 4) => {
    if (!renderContent || !mermaidRef.current) {
      toast.error(t.stateDiagram.errors.noContent);
      return;
    }

    try {
      // 创建临时容器用于高质量渲染
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.padding = '20px';
      tempContainer.innerHTML = renderContent;
      document.body.appendChild(tempContainer);

      // 获取SVG元素并设置高质量属性
      const svgElement = tempContainer.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = 'none';
        svgElement.style.height = 'auto';
        
        // 设置SVG的实际尺寸
        const bbox = svgElement.getBBox();
        const width = bbox.width + 40; // 添加边距
        const height = bbox.height + 40;
        
        svgElement.setAttribute('width', width.toString());
        svgElement.setAttribute('height', height.toString());
      }

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: customScale,
        useCORS: true,
        allowTaint: true,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });
      
      // 清理临时容器
      document.body.removeChild(tempContainer);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `state-diagram-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success(t.stateDiagram.messages.exported);
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('PNG export error:', error);
      toast.error(t.stateDiagram.errors.exportFailed);
    }
  };

  // 导出高分辨率PNG
  const exportHighResPNG = () => exportPNG(6);

  // 导出超高分辨率PNG
  const exportUltraHighResPNG = () => exportPNG(8);

  // 上传文件
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCode(content);
      toast.success(t.stateDiagram.messages.fileLoaded);
    };
    reader.readAsText(file);
  };

  // 重置代码
  const resetCode = () => {
    if (confirm(t.stateDiagram.prompts.resetCode)) {
      setCode(defaultCode);
      toast.success(t.stateDiagram.messages.reset);
    }
  };

  // 应用模板
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCode(template.code);
      setSelectedTemplate(templateId);
      toast.success(t.stateDiagram.messages.templateApplied);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* 顶部导航栏 */}
      <Navigation />
      
      {/* 头部导航 - Google风格简洁设计 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 relative z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Activity className="w-5 h-5 text-blue-500" />
            <h1 className="text-xl font-medium text-gray-900">
              {t.stateDiagram.title}
            </h1>
          </div>
          
          {/* 功能按钮区域 - 移动到右上角 */}
          <div className="flex items-center space-x-1 md:space-x-2 overflow-x-auto">
            <button
              onClick={saveToHistory}
              className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
              title="保存到历史记录"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">{t.stateDiagram.buttons.save}</span>
            </button>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
              title={t.stateDiagram.buttons.copy}
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">{t.stateDiagram.buttons.copy}</span>
            </button>
            <button
              onClick={exportSVG}
              className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
              title="导出SVG格式"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t.stateDiagram.buttons.exportSvg}</span>
            </button>
            <button
              onClick={() => exportPNG()}
              className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
              title="导出PNG格式"
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">{t.stateDiagram.buttons.exportPng}</span>
            </button>
            <button
              onClick={exportHighResPNG}
              className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
              title="导出高清PNG格式"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.stateDiagram.buttons.exportHighResPng}</span>
            </button>
            <label className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 hover:shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
              title={t.stateDiagram.buttons.upload}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">{t.stateDiagram.buttons.upload}</span>
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={resetCode}
              className="flex items-center gap-2 px-2 md:px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 hover:shadow-sm transition-all duration-200 whitespace-nowrap"
              title="重置代码"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">{t.stateDiagram.buttons.reset}</span>
            </button>
          </div>
        </div>
      </div>
      {/* 主体图表显示区域 - 固定画布容器 */}
      <div 
        className="w-full h-screen flex items-center justify-center bg-white dot-grid-background overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          minHeight: 'calc(100vh - 100px)',
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          userSelect: isPanning || isTouching ? 'none' : 'auto',
          touchAction: 'none' // 防止默认的触摸行为
        }}
      >
        {/* 可变换的内容容器 */}
        <div
          className="flex items-center justify-center"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center center',
            cursor: isPanning ? 'grabbing' : 'grab'
          }}
        >
          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="text-gray-500 text-lg">
                {t.stateDiagram.preview.loading}
              </div>
            </div>
          )}
          {renderError && (
            <div className="flex items-center justify-center">
              <div className="text-red-500 text-center">
                <div className="mb-2 text-lg">渲染失败</div>
                <div className="text-sm text-gray-500">
                  {renderError}
                </div>
              </div>
            </div>
          )}
          {!isLoading && !renderError && renderContent && (
            <div 
              ref={mermaidRef}
              className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm"
              dangerouslySetInnerHTML={{ __html: renderContent }}
            />
          )}
        </div>
      </div>

      {/* 现代化缩放控制工具栏 - 右下角位置 */}
      <div className="fixed bottom-6 right-6 z-10 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-lg p-2 flex items-center space-x-1">
        <button
          onClick={handleZoomIn}
          className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm"
          title={t.stateDiagram.buttons.zoomIn}
        >
          <ZoomIn className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleZoomOut}
          className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-sm"
          title={t.stateDiagram.buttons.zoomOut}
        >
          <ZoomOut className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleResetView}
          className="flex items-center justify-center w-12 h-12 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:shadow-sm"
          title={t.stateDiagram.buttons.resetView}
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100/80 rounded-lg border border-gray-200/60">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* 悬浮编辑器面板 - 简洁设计 */}
      {isEditorVisible && (
        <div
          className={`absolute bg-white rounded-lg border border-gray-200 shadow-sm z-30 flex flex-col ${
            isMobile ? 'inset-4' : 'max-w-[90vw]'
          }`}
          style={isMobile ? {
            cursor: isDragging ? 'grabbing' : 'grab'
          } : {
            left: Math.min(editorPosition.x, window.innerWidth - editorSize.width - 20),
            top: Math.min(editorPosition.y, window.innerHeight - editorSize.height - 20),
            width: Math.min(editorSize.width, window.innerWidth - 40),
            height: Math.min(editorSize.height, window.innerHeight - 40),
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {/* 编辑器头部 - 简洁设计 */}
          <div 
            className="drag-handle flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white rounded-t-lg cursor-move"
            onMouseDown={handleEditorMouseDown}
          >
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-900">
                {t.stateDiagram.editor.title}
              </h3>
            </div>
            <button
              onClick={() => setIsEditorVisible(false)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>

          {/* 现代化Tab导航 - 改进设计 */}
          <div className="flex border-b border-gray-100 px-4 bg-gray-50/30">
            <button
              onClick={() => setActiveEditorTab('code')}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 rounded-t-md ${
                activeEditorTab === 'code'
                  ? 'text-blue-600 border-blue-500 bg-white shadow-sm'
                  : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                {t.stateDiagram.buttons.codeEditor}
              </div>
            </button>
            <button
              onClick={() => setActiveEditorTab('templates')}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ml-1 rounded-t-md ${
                activeEditorTab === 'templates'
                  ? 'text-blue-600 border-blue-500 bg-white shadow-sm'
                  : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {t.stateDiagram.buttons.templateLibrary}
              </div>
            </button>
            <button
              onClick={() => setActiveEditorTab('history')}
              className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ml-1 rounded-t-md ${
                activeEditorTab === 'history'
                  ? 'text-blue-600 border-blue-500 bg-white shadow-sm'
                  : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                {t.stateDiagram.buttons.historyRecords}
              </div>
            </button>
          </div>

          {/* 工具栏 - 功能按钮已移动到页面顶部header区域 */}

          {/* 编辑器内容 - 简洁设计 */}
          <div className="flex-1" style={{ 
            height: isMobile ? 'calc(100vh - 250px)' : editorSize.height - 140 
          }}>
            {activeEditorTab === 'code' ? (
              <div className="h-full px-4 pb-4">
                <textarea
                  ref={editorRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    // 确保Ctrl+A全选快捷键正常工作
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                      // 让浏览器处理默认的全选行为
                      return;
                    }
                  }}
                  className="w-full h-full resize-none border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white rounded-lg p-4 text-sm font-mono text-gray-900 placeholder-gray-500"
                  placeholder={t.stateDiagram.editor.placeholder}
                  spellCheck={false}
                />
              </div>
            ) : activeEditorTab === 'templates' ? (
              <div className="h-full px-4 pb-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    {t.stateDiagram.buttons.templateLibrary}
                  </h4>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {templates.length}
                  </div>
                </div>
                <div className="space-y-3">
                  {templates.map((template, index) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        applyTemplate(template.id);
                        setActiveEditorTab('code');
                        toast.success(`已应用模板: ${template.name}`);
                      }}
                      className={`group w-full text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                        selectedTemplate === template.id
                          ? 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                          {template.name}
                        </span>
                        {selectedTemplate === template.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-mono bg-gray-100/60 p-3 rounded-lg border border-gray-100 group-hover:bg-gray-200/60 transition-colors">
                        {template.code.split('\n').slice(0, 3).join('\n')}
                        {template.code.split('\n').length > 3 && '\n...'}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {template.code.split('\n').length} 行代码
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full px-4 pb-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    {t.stateDiagram.buttons.historyRecords}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {history.length}
                    </div>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        清空
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 group"
                      onClick={() => {
                        loadFromHistory(item);
                        setActiveEditorTab('code');
                        toast.success(`已加载历史记录: ${item.name}`);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 font-mono bg-gray-100/60 p-3 rounded-lg border border-gray-100 truncate group-hover:bg-gray-200/60 transition-colors">
                        {item.code.split('\n')[0]}...
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.code.split('\n').length} 行代码
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <div className="text-gray-500 text-sm">
                        {t.stateDiagram.history.empty}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {t.stateDiagram.messages.noHistory}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 编辑器调整大小手柄 - 仅在非移动端显示 */}
          {!isMobile && (
            <>
              <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
                   onMouseDown={(e) => handleEditorResizeStart(e, 'se')}
                   title={t.stateDiagram.tooltips.dragToResize}>
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400"></div>
              </div>
              <div className="absolute bottom-0 right-4 left-4 h-1 cursor-ns-resize opacity-0 hover:opacity-50 transition-opacity"
                   onMouseDown={(e) => handleEditorResizeStart(e, 's')}>
              </div>
              <div className="absolute top-4 bottom-4 right-0 w-1 cursor-ew-resize opacity-0 hover:opacity-50 transition-opacity"
                   onMouseDown={(e) => handleEditorResizeStart(e, 'e')}>
              </div>
            </>
          )}


        </div>
      )}





      {/* 现代化编辑器切换按钮 - 底部居中 */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={() => setIsEditorVisible(!isEditorVisible)}
          className="px-5 py-3 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 text-sm font-medium text-gray-700 shadow-lg hover:shadow-xl hover:scale-105"
          title={isEditorVisible ? t.stateDiagram.buttons.hideEditor : t.stateDiagram.buttons.showEditor}
        >
          {isEditorVisible ? (
            <>
              <ChevronDown className="w-5 h-5" />
              <span>隐藏编辑器</span>
            </>
          ) : (
            <>
              <Edit className="w-5 h-5" />
              <span>显示编辑器</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StateDiagram;