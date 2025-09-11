import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { 
  Upload, 
  Download, 
  Copy, 
  Trash2, 
  FileSpreadsheet, 
  FileText, 
  History, 
  X,
  Database
} from 'lucide-react';
import Navigation from '../components/Navigation';
import SEO from '../components/SEO';
import { useI18n } from '../hooks/useI18n';
import { useJsonStore } from '../store/jsonStore';

type ConversionMode = 'excel-to-json' | 'json-to-excel' | 'csv-to-json' | 'json-to-csv';
type DataFormat = 'excel' | 'csv';

interface ConversionHistory {
  id: string;
  type: ConversionMode;
  input: string;
  output: string;
  timestamp: number;
  filename?: string;
}

const ExcelConverter: React.FC = () => {
  const { t } = useI18n();
  const { addToHistory } = useJsonStore();
  const [mode, setMode] = useState<ConversionMode>('excel-to-json');
  const [format, setFormat] = useState<DataFormat>('excel');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [excelData, setExcelData] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [csvOptions, setCsvOptions] = useState({
    delimiter: ',',
    encoding: 'UTF-8',
    hasHeader: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler for both Excel and CSV
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    if (format === 'excel') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          const output = JSON.stringify(jsonData, null, 2);
          setJsonOutput(output);
          
          // Add to history
          const historyItem: ConversionHistory = {
            id: Date.now().toString(),
            type: 'excel-to-json',
            input: '',
            output,
            filename: file.name,
            timestamp: Date.now()
          };
          setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
          addToHistory({
          type: 'conversion',
          input: `File: ${file.name}`,
          output: JSON.stringify(jsonData, null, 2),
          timestamp: new Date(historyItem.timestamp)
        });
        } catch (err) {
          setError('Excel文件解析失败，请检查文件格式是否正确');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (format === 'csv') {
      Papa.parse(file, {
        delimiter: csvOptions.delimiter,
        header: csvOptions.hasHeader,
        encoding: csvOptions.encoding,
        complete: (results) => {
          try {
            const output = JSON.stringify(results.data, null, 2);
            setJsonOutput(output);
            
            // Add to history
            const historyItem: ConversionHistory = {
              id: Date.now().toString(),
              type: 'csv-to-json',
              input: '',
              output,
              filename: file.name,
              timestamp: Date.now()
            };
            setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
            addToHistory({
                type: 'conversion',
                input: `File: ${file.name}`,
                output: output,
                timestamp: new Date(historyItem.timestamp)
              });
          } catch (err) {
            setError('CSV文件解析失败，请检查文件格式是否正确');
          } finally {
            setIsLoading(false);
          }
        },
        error: (error) => {
          setError(`CSV解析错误: ${error.message}`);
          setIsLoading(false);
        }
      });
    }
  }, [format, csvOptions, addToHistory]);

  // JSON to File conversion
  const handleJsonToFile = useCallback(() => {
    if (!jsonInput.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const data = JSON.parse(jsonInput);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      if (format === 'excel') {
        // Ensure data is an array
        const arrayData = Array.isArray(data) ? data : [data];
        
        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(arrayData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        
        const filename = `converted_${timestamp}.xlsx`;
        XLSX.writeFile(workbook, filename);
        
        // Add to history
        const historyItem: ConversionHistory = {
          id: Date.now().toString(),
          type: 'json-to-excel',
          input: jsonInput,
          output: filename,
          timestamp: Date.now(),
          filename
        };
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
        addToHistory({
          type: 'conversion',
          input: jsonInput,
          output: `Excel file downloaded: ${filename}`,
          timestamp: new Date(historyItem.timestamp)
        });
      } else if (format === 'csv') {
        const arrayData = Array.isArray(data) ? data : [data];
        const csvData = Papa.unparse(arrayData, {
          delimiter: csvOptions.delimiter,
          header: csvOptions.hasHeader
        });
        
        const filename = `converted_${timestamp}.csv`;
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Add to history
        const historyItem: ConversionHistory = {
          id: Date.now().toString(),
          type: 'json-to-csv',
          input: jsonInput,
          output: filename,
          timestamp: Date.now(),
          filename
        };
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
        addToHistory({
          type: 'conversion',
          input: jsonInput,
          output: `CSV file downloaded: ${filename}`,
          timestamp: new Date(historyItem.timestamp)
        });
      }
    } catch (err) {
      setError('JSON格式错误，请检查输入');
      console.error('JSON parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [jsonInput, format, csvOptions, addToHistory]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show success message (could be enhanced with toast)
    }).catch(() => {
      setError('复制失败');
    });
  }, []);

  // Clear data
  const clearData = useCallback(() => {
    setJsonInput('');
    setJsonOutput('');
    setExcelData([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Load from history
  const loadFromHistory = useCallback((item: ConversionHistory) => {
    if (item.type === 'excel-to-json') {
      setMode('excel-to-json');
      setJsonOutput(item.output);
    } else {
      setMode('json-to-excel');
      setJsonInput(item.input);
    }
    setShowHistory(false);
  }, []);

  return (
    <>
      <SEO
        page="excel"
        title={t.seo.excel.title}
        description={t.seo.excel.description}
        keywords={t.seo.excel.keywords}
      />
      <Navigation />
      
      <main className="min-h-screen bg-bj-bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-bj-bg-card rounded-lg border border-bj-border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-6 h-6 text-bj-accent-blue" />
                <h1 className="text-xl font-semibold text-bj-text-primary">
                  数据转换工具
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-3">
                  {/* Format Selector */}
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => {
                        setFormat('excel');
                        setMode(mode.includes('excel') ? mode : 'excel-to-json');
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        format === 'excel'
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel</span>
                    </button>
                    <button
                      onClick={() => {
                        setFormat('csv');
                        setMode(mode.includes('csv') ? mode : 'csv-to-json');
                      }}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        format === 'csv'
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Database className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                  </div>
                  
                  {/* Mode Switcher */}
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setMode(format === 'excel' ? 'excel-to-json' : 'csv-to-json')}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        mode === (format === 'excel' ? 'excel-to-json' : 'csv-to-json')
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {format === 'excel' ? <FileSpreadsheet className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                      <span>转JSON</span>
                    </button>
                    <button
                      onClick={() => setMode(format === 'excel' ? 'json-to-excel' : 'json-to-csv')}
                      className={`px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        mode === (format === 'excel' ? 'json-to-excel' : 'json-to-csv')
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>转{format === 'excel' ? 'Excel' : 'CSV'}</span>
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-bj-text-secondary hover:text-bj-accent-blue hover:bg-bj-bg-secondary rounded-md transition-colors"
                      title="上传文件"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    
                    {jsonOutput && (
                      <button
                        onClick={() => copyToClipboard(jsonOutput)}
                        className="p-2 text-bj-text-secondary hover:text-bj-accent-blue hover:bg-bj-bg-secondary rounded-md transition-colors"
                        title="复制结果"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    
                    {mode.includes('json-to') && (
                      <button
                        onClick={handleJsonToFile}
                        disabled={isLoading || !jsonInput.trim()}
                        className="p-2 text-bj-text-secondary hover:text-bj-accent-blue hover:bg-bj-bg-secondary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`下载${format === 'excel' ? 'Excel' : 'CSV'}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={clearData}
                      className="p-2 text-bj-text-secondary hover:text-bj-accent-blue hover:bg-bj-bg-secondary rounded-md transition-colors"
                      title="清除数据"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="p-2 text-bj-text-secondary hover:text-bj-accent-blue hover:bg-bj-bg-secondary rounded-md transition-colors"
                      title="历史记录"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>



          <div className={`grid gap-8 ${showHistory ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {/* Main Content */}
            <div className={showHistory ? 'lg:col-span-3' : 'col-span-1'}>
              <div className="bg-bj-bg-card rounded-lg border border-bj-border p-6">
                {mode.includes('to-json') ? (
                  /* File to JSON Mode */
                  <div className="space-y-6">
                    {/* CSV Options */}
                    {format === 'csv' && (
                      <div className="bg-bj-bg-secondary rounded-lg p-4 border border-bj-border">
                        <h3 className="text-sm font-medium text-bj-text-primary mb-3">CSV解析选项</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-bj-text-secondary mb-1">
                              分隔符
                            </label>
                            <select
                              value={csvOptions.delimiter}
                              onChange={(e) => setCsvOptions(prev => ({ ...prev, delimiter: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-bj-border rounded-md bg-bj-bg-primary text-bj-text-primary focus:outline-none focus:ring-2 focus:ring-bj-accent-blue focus:border-transparent"
                            >
                              <option value=",">逗号 (,)</option>
                              <option value=";">分号 (;)</option>
                              <option value="\t">制表符 (Tab)</option>
                              <option value="|">竖线 (|)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-bj-text-secondary mb-1">
                              编码
                            </label>
                            <select
                              value={csvOptions.encoding}
                              onChange={(e) => setCsvOptions(prev => ({ ...prev, encoding: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-bj-border rounded-md bg-bj-bg-primary text-bj-text-primary focus:outline-none focus:ring-2 focus:ring-bj-accent-blue focus:border-transparent"
                            >
                              <option value="UTF-8">UTF-8</option>
                              <option value="GBK">GBK</option>
                              <option value="GB2312">GB2312</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center space-x-2 text-sm text-bj-text-primary">
                              <input
                                type="checkbox"
                                checked={csvOptions.hasHeader}
                                onChange={(e) => setCsvOptions(prev => ({ ...prev, hasHeader: e.target.checked }))}
                                className="rounded border-bj-border text-bj-accent-blue focus:ring-bj-accent-blue focus:ring-offset-0"
                              />
                              <span>包含表头</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-bj-text-primary mb-2">
                        上传{format === 'excel' ? 'Excel' : 'CSV'}文件
                      </label>
                      <div className="border-2 border-dashed border-bj-border rounded-lg p-8 text-center hover:border-bj-accent-blue transition-colors">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={format === 'excel' ? '.xlsx,.xls' : '.csv'}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload className="w-12 h-12 text-bj-text-secondary mx-auto mb-4" />
                        <p className="text-bj-text-secondary mb-2">点击选择{format === 'excel' ? 'Excel' : 'CSV'}文件或拖拽文件到此处</p>
                        <p className="text-sm text-bj-text-tertiary">
                          支持 {format === 'excel' ? '.xlsx 和 .xls' : '.csv'} 格式
                        </p>

                      </div>
                    </div>

                    {/* JSON Output */}
                    {jsonOutput && (
                      <div>
                        <div className="mb-2">
                          <label className="text-sm font-medium text-bj-text-primary">
                            转换结果 (JSON)
                          </label>
                        </div>
                        <textarea
                          value={jsonOutput}
                          readOnly
                          className="w-full h-96 p-4 border border-bj-border rounded-md bg-bj-bg-primary text-bj-text-primary font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-bj-accent-blue focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* JSON to File Mode */
                  <div className="space-y-6">
                    {/* CSV Options for JSON to CSV */}
                    {format === 'csv' && (
                      <div className="bg-bj-bg-secondary rounded-lg p-4 border border-bj-border">
                        <h3 className="text-sm font-medium text-bj-text-primary mb-3">CSV导出选项</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-bj-text-secondary mb-1">
                              分隔符
                            </label>
                            <select
                              value={csvOptions.delimiter}
                              onChange={(e) => setCsvOptions(prev => ({ ...prev, delimiter: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-bj-border rounded-md bg-bj-bg-primary text-bj-text-primary focus:outline-none focus:ring-2 focus:ring-bj-accent-blue focus:border-transparent"
                            >
                              <option value=",">逗号 (,)</option>
                              <option value=";">分号 (;)</option>
                              <option value="\t">制表符 (Tab)</option>
                              <option value="|">竖线 (|)</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center space-x-2 text-sm text-bj-text-primary">
                              <input
                                type="checkbox"
                                checked={csvOptions.hasHeader}
                                onChange={(e) => setCsvOptions(prev => ({ ...prev, hasHeader: e.target.checked }))}
                                className="rounded border-bj-border text-bj-accent-blue focus:ring-bj-accent-blue focus:ring-offset-0"
                              />
                              <span>包含表头</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* JSON Input */}
                    <div>
                      <label className="block text-sm font-medium text-bj-text-primary mb-2">
                        输入JSON数据
                      </label>
                      <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="请输入要转换的JSON数据，支持数组和对象格式"
                        className="w-full h-96 p-4 border border-bj-border rounded-md bg-bj-bg-primary text-bj-text-primary font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-bj-accent-blue focus:border-transparent"
                      />
                    </div>


                  </div>
                )}



                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* History Sidebar */}
            {showHistory && (
              <div className="lg:col-span-1">
                <div className="bg-bj-bg-card rounded-lg border border-bj-border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-bj-text-primary flex items-center space-x-2">
                      <History className="w-5 h-5" />
                      <span>转换历史</span>
                    </h3>
                    {history.length > 0 && (
                      <button
                        onClick={() => setHistory([])}
                        className="text-bj-text-tertiary hover:text-bj-text-secondary transition-colors"
                        title="清空历史"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {history.length === 0 ? (
                      <p className="text-bj-text-tertiary text-sm text-center py-8">
                        暂无转换历史
                      </p>
                    ) : (
                      history.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => loadFromHistory(item)}
                          className="p-3 border border-bj-border rounded-md hover:bg-bj-bg-secondary cursor-pointer transition-colors"
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {item.type === 'excel-to-json' ? (
                              <FileSpreadsheet className="w-4 h-4 text-green-500" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="text-xs text-bj-text-tertiary">
                              {item.type === 'excel-to-json' ? 'Excel→JSON' : 'JSON→Excel'}
                            </span>
                          </div>
                          <p className="text-sm text-bj-text-primary truncate">
                            {item.filename || (item.input.length > 30 ? item.input.substring(0, 30) + '...' : item.input)}
                          </p>
                          <p className="text-xs text-bj-text-tertiary">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ExcelConverter;