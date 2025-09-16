import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import TurndownService from 'turndown';
import { useI18n } from '../hooks/useI18n';
import SEO from '../components/SEO';

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ConversionResult {
  markdown: string;
  originalFileName: string;
  fileType: string;
}

interface ConversionError {
  message: string;
  type: 'file' | 'conversion' | 'network';
}

const DocToMarkdown: React.FC = () => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<ConversionError | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 支持的文件类型
  const supportedTypes = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/pdf': 'pdf',
    'application/msword': 'doc'
  };

  // 文件验证
  const validateFile = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      setError({
        message: t.docToMarkdown.errors.fileTooLarge,
        type: 'file'
      });
      return false;
    }

    if (!Object.keys(supportedTypes).includes(file.type)) {
      setError({
        message: t.docToMarkdown.errors.unsupportedFormat,
        type: 'file'
      });
      return false;
    }

    return true;
  };

  // 处理DOC文件（老版本Word格式）- 通过后端API
  const convertDoc = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/document/convert-doc', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'DOC文件转换失败');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'DOC文件转换失败');
      }
      
      return result.data.markdown;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('DOC文件解析失败，请检查文件是否损坏或尝试转换为DOCX格式');
    }
  };

  // 处理DOCX文件
  const convertDocx = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      // 使用 Turndown 将 HTML 转换为 Markdown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
      });
      
      // 自定义规则以更好地处理表格
      turndownService.addRule('table', {
        filter: 'table',
        replacement: function (content) {
          return '\n\n' + content + '\n\n';
        }
      });
      
      return turndownService.turndown(result.value);
    } catch (error) {
      throw new Error(t.docToMarkdown.errors.docxConversion);
    }
  };

  // 处理PDF文件
  const convertPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let pageText = '';
        textContent.items.forEach((item: any) => {
          if ('str' in item) {
            pageText += item.str + ' ';
          }
        });
        
        // 简单的格式化处理
        pageText = pageText
          .replace(/\s+/g, ' ')
          .replace(/([.!?])\s+/g, '$1\n\n')
          .trim();
        
        if (pageText) {
          fullText += `## 第 ${i} 页\n\n${pageText}\n\n`;
        }
      }
      
      return fullText || t.docToMarkdown.errors.noTextFound;
    } catch (error) {
      throw new Error(t.docToMarkdown.errors.pdfConversion);
    }
  };

  // 主转换函数
  const convertFile = async (file: File) => {
    if (!validateFile(file)) return;
    
    setIsConverting(true);
    setError(null);
    setResult(null);
    
    try {
      let markdown = '';
      const fileType = supportedTypes[file.type as keyof typeof supportedTypes];
      
      switch (fileType) {
        case 'docx':
          markdown = await convertDocx(file);
          break;
        case 'doc':
          markdown = await convertDoc(file);
          break;
        case 'pdf':
          markdown = await convertPdf(file);
          break;
        default:
          throw new Error(t.docToMarkdown.errors.unsupportedFormat);
      }
      
      setResult({
        markdown,
        originalFileName: file.name,
        fileType
      });
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : t.docToMarkdown.errors.unknown,
        type: 'conversion'
      });
    } finally {
      setIsConverting(false);
    }
  };

  // 文件选择处理
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    convertFile(selectedFile);
  };

  // 拖拽处理
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // 下载Markdown文件
  const downloadMarkdown = () => {
    if (!result) return;
    
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.originalFileName.replace(/\.[^/.]+$/, '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.markdown);
      // 这里可以添加成功提示
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = result.markdown;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEO 
        page="formatter"
        title={t.docToMarkdown.title}
        description={t.docToMarkdown.description}
      />
      
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t.docToMarkdown.title}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.docToMarkdown.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 上传区域 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t.docToMarkdown.upload.title}
            </h2>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.doc"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  {t.docToMarkdown.upload.dragText}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={isConverting}
                >
                  {t.docToMarkdown.upload.selectFile}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  {t.docToMarkdown.upload.supportedFormats}
                </p>
              </div>
            </div>

            {/* 转换状态 */}
            {isConverting && (
              <div className="mt-4 flex items-center justify-center text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {t.docToMarkdown.converting}
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700">{error.message}</span>
                </div>
              </div>
            )}

            {/* 成功信息 */}
            {result && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700">
                    文档 {result.originalFileName} 转换成功！
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 结果区域 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t.docToMarkdown.result.title}
              </h2>
              {result && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    {t.docToMarkdown.result.copy}
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {t.docToMarkdown.result.download}
                  </button>
                </div>
              )}
            </div>
            
            {result ? (
              <div className="border border-gray-200 rounded-md">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center">
                  <FileText className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {result.originalFileName.replace(/\.[^/.]+$/, '')}.md
                  </span>
                </div>
                <textarea
                  value={result.markdown}
                  readOnly
                  className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none"
                  placeholder={t.docToMarkdown.result.placeholder}
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>{t.docToMarkdown.result.empty}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t.docToMarkdown.instructions.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {t.docToMarkdown.instructions.supported.title}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• DOCX (Microsoft Word)</li>
                <li>• PDF (Portable Document Format)</li>
                <li>• DOC (Legacy Microsoft Word)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {t.docToMarkdown.instructions.features.title}
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {t.docToMarkdown.instructions.features.headings}</li>
                <li>• {t.docToMarkdown.instructions.features.paragraphs}</li>
                <li>• {t.docToMarkdown.instructions.features.lists}</li>
                <li>• {t.docToMarkdown.instructions.features.tables}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocToMarkdown;