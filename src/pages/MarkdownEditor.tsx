import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Edit3, 
  Download, 
  Settings, 
  FileText, 
  Image, 
  Printer,
  Split,
  Maximize2,
  Save,
  Upload,
  Palette,
  BarChart3
} from 'lucide-react';

interface MarkdownEditorProps {}

const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
  const [content, setContent] = useState<string>(`# 欢迎使用 Markdown 编辑器

这是一个功能强大的在线 Markdown 编辑器，支持实时预览、多种导出格式和丰富的扩展功能。

## 主要功能

### 1. 基础 Markdown 语法
- **粗体文本**
- *斜体文本*
- [链接](https://example.com)
- \`行内代码\`

### 2. 代码块
\`\`\`javascript
function hello() {
  console.log("Hello, Markdown!");
}
\`\`\`

### 3. 任务列表
- [x] 支持基础 Markdown 语法
- [x] 实时预览功能
- [ ] 流程图支持
- [ ] 导出功能

### 4. 表格
| 功能 | 状态 | 优先级 |
|------|------|--------|
| 编辑器 | ✅ | 高 |
| 预览 | ✅ | 高 |
| 导出 | 🚧 | 中 |

### 5. 数学公式
$$E = mc^2$$

---

开始编辑您的 Markdown 文档吧！`);

  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // 保存到本地存储
  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-editor-content');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('markdown-editor-content', content);
  }, [content]);

  // 简单的 Markdown 转 HTML 函数
  const markdownToHtml = (markdown: string): string => {
    let html = markdown
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体和斜体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 分割线
      .replace(/^---$/gim, '<hr>')
      // 任务列表
      .replace(/^- \[x\] (.*)$/gim, '<div class="task-item completed">✅ $1</div>')
      .replace(/^- \[ \] (.*)$/gim, '<div class="task-item">☐ $1</div>')
      // 普通列表
      .replace(/^- (.*)$/gim, '<li>$1</li>')
      // 段落
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // 处理代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });

    // 处理数学公式
    html = html.replace(/\$\$(.*?)\$\$/g, '<div class="math-formula">$1</div>');

    // 处理表格
    const tableRegex = /\|(.+)\|\n\|(.+)\|\n((\|.+\|\n?)+)/g;
    html = html.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n');
      const headers = lines[0].split('|').slice(1, -1).map(h => h.trim());
      const rows = lines.slice(2).map(line => 
        line.split('|').slice(1, -1).map(cell => cell.trim())
      );
      
      let table = '<table class="markdown-table"><thead><tr>';
      headers.forEach(header => {
        table += `<th>${header}</th>`;
      });
      table += '</tr></thead><tbody>';
      
      rows.forEach(row => {
        table += '<tr>';
        row.forEach(cell => {
          table += `<td>${cell}</td>`;
        });
        table += '</tr>';
      });
      
      table += '</tbody></table>';
      return table;
    });

    return `<div class="markdown-content">${html}</div>`;
  };

  const handleExport = (format: 'md' | 'html' | 'pdf') => {
    const filename = `document.${format}`;
    let dataStr = '';
    let mimeType = '';

    switch (format) {
      case 'md':
        dataStr = content;
        mimeType = 'text/markdown';
        break;
      case 'html':
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
    .task-item { margin: 5px 0; }
    .task-item.completed { color: #666; text-decoration: line-through; }
    .markdown-table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    .markdown-table th, .markdown-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .markdown-table th { background-color: #f2f2f2; }
    .math-formula { text-align: center; font-style: italic; margin: 10px 0; }
  </style>
</head>
<body>
  ${markdownToHtml(content)}
</body>
</html>`;
        dataStr = htmlContent;
        mimeType = 'text/html';
        break;
      case 'pdf':
        // PDF 导出需要额外的库支持，这里先提示
        alert('PDF 导出功能需要额外配置，请使用浏览器的打印功能导出 PDF');
        return;
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/markdown') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setContent(text);
      };
      reader.readAsText(file);
    }
  };

  const insertTemplate = (template: string) => {
    const textarea = editorRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + template + content.substring(end);
      setContent(newContent);
      
      // 重新聚焦并设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + template.length, start + template.length);
      }, 0);
    }
  };

  const templates = {
    table: '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容1 | 内容2 | 内容3 |\n',
    codeBlock: '\n```javascript\n// 在这里输入代码\nconsole.log("Hello World");\n```\n',
    mathFormula: '\n$$\nE = mc^2\n$$\n',
    taskList: '\n- [ ] 待完成任务\n- [x] 已完成任务\n',
    flowchart: '\n```mermaid\ngraph TD\n    A[开始] --> B{判断}\n    B -->|是| C[执行]\n    B -->|否| D[结束]\n    C --> D\n```\n'
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* 工具栏 */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Markdown 编辑器</h1>
            
            {/* 视图模式切换 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('edit')}
                className={`p-2 rounded ${viewMode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                title="编辑模式"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`p-2 rounded ${viewMode === 'split' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                title="分屏模式"
              >
                <Split size={16} />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`p-2 rounded ${viewMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                title="预览模式"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 插入模板 */}
            <div className="relative group">
              <button className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">
                <BarChart3 size={16} />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-10">
                <button
                  onClick={() => insertTemplate(templates.table)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  插入表格
                </button>
                <button
                  onClick={() => insertTemplate(templates.codeBlock)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  代码块
                </button>
                <button
                  onClick={() => insertTemplate(templates.mathFormula)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  数学公式
                </button>
                <button
                  onClick={() => insertTemplate(templates.taskList)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  任务列表
                </button>
              </div>
            </div>

            {/* 文件操作 */}
            <label className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer">
              <Upload size={16} />
              <input
                type="file"
                accept=".md,.markdown"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* 导出功能 */}
            <div className="relative group">
              <button className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">
                <Download size={16} />
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg hidden group-hover:block z-10">
                <button
                  onClick={() => handleExport('md')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  导出 Markdown
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  导出 HTML
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  导出 PDF
                </button>
              </div>
            </div>

            {/* 主题切换 */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              title="切换主题"
            >
              <Palette size={16} />
            </button>

            {/* 全屏 */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              title="全屏"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 编辑器主体 */}
      <div className={`flex ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-80px)]'}`}>
        {/* 编辑区域 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className={`p-2 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
              <span className="text-sm text-gray-500">编辑器 ({content.length} 字符)</span>
            </div>
            <textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`flex-1 p-4 font-mono text-sm resize-none outline-none ${
                theme === 'dark' 
                  ? 'bg-gray-900 text-gray-100' 
                  : 'bg-white text-gray-900'
              }`}
              placeholder="在这里输入 Markdown 内容..."
            />
          </div>
        )}

        {/* 预览区域 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-l' : 'w-full'} flex flex-col ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`p-2 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
              <span className="text-sm text-gray-500">预览</span>
            </div>
            <div
              ref={previewRef}
              className={`flex-1 p-4 overflow-auto ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
            />
          </div>
        )}
      </div>

      {/* 自定义样式 */}
      <style jsx="true">{`
        .markdown-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          color: ${theme === 'dark' ? '#fff' : '#333'};
        }
        .markdown-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.8rem 0;
          color: ${theme === 'dark' ? '#fff' : '#333'};
        }
        .markdown-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.6rem 0;
          color: ${theme === 'dark' ? '#fff' : '#333'};
        }
        .markdown-content p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        .markdown-content code {
          background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        .markdown-content pre {
          background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
          padding: 1rem;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .markdown-content pre code {
          background: none;
          padding: 0;
        }
        .task-item {
          margin: 5px 0;
          padding: 2px 0;
        }
        .task-item.completed {
          color: #666;
          text-decoration: line-through;
        }
        .markdown-table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }
        .markdown-table th,
        .markdown-table td {
          border: 1px solid ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
          padding: 8px 12px;
          text-align: left;
        }
        .markdown-table th {
          background-color: ${theme === 'dark' ? '#374151' : '#f9fafb'};
          font-weight: bold;
        }
        .math-formula {
          text-align: center;
          font-style: italic;
          margin: 1rem 0;
          padding: 0.5rem;
          background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
          border-radius: 5px;
        }
        .markdown-content hr {
          border: none;
          border-top: 2px solid ${theme === 'dark' ? '#4b5563' : '#e5e7eb'};
          margin: 2rem 0;
        }
        .markdown-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .markdown-content a:hover {
          color: #1d4ed8;
        }
        .markdown-content li {
          margin: 0.25rem 0;
          margin-left: 1.5rem;
          list-style-type: disc;
        }
        .markdown-content strong {
          font-weight: bold;
        }
        .markdown-content em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default MarkdownEditor;