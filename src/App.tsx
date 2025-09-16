import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Formatter from "@/pages/Formatter";
import Diff from "@/pages/Diff";
import ExcelConverter from "@/pages/ExcelConverter";
import DocToMarkdown from "@/pages/DocToMarkdown";
import StateDiagram from "@/pages/StateDiagram";
import MarkdownEditor from "@/pages/MarkdownEditor";
import { useI18n } from "@/hooks/useI18n";
import { useEffect } from "react";

// 语言路由重定向组件
const LanguageRedirect = () => {
  const { language } = useI18n();
  const location = useLocation();
  
  useEffect(() => {
    // 如果当前路径没有语言前缀，重定向到带语言前缀的路径
    const pathWithoutLang = location.pathname;
    const hasLangPrefix = /^\/(zh|en)(\/|$)/.test(pathWithoutLang);
    
    if (!hasLangPrefix && pathWithoutLang !== '/') {
      const newPath = `/${language}${pathWithoutLang}`;
      window.history.replaceState(null, '', newPath);
    }
  }, [language, location.pathname]);
  
  return null;
};

export default function App() {
  return (
    <Router>
      <LanguageRedirect />
      <Routes>
        {/* 默认路径重定向到格式化工具 */}
        <Route path="/" element={<Navigate to="/formatter" replace />} />
        
        {/* 中文路由 */}
        <Route path="/zh" element={<Navigate to="/zh/formatter" replace />} />
        <Route path="/zh/formatter" element={<Formatter />} />
        <Route path="/zh/diff" element={<Diff />} />
        <Route path="/zh/jsondiff" element={<Diff />} />
        <Route path="/zh/excel" element={<ExcelConverter />} />
        <Route path="/zh/doc-to-markdown" element={<DocToMarkdown />} />
        <Route path="/zh/statediagram" element={<StateDiagram />} />
        <Route path="/zh/markdown-editor" element={<MarkdownEditor />} />
        
        {/* 英文路由 */}
        <Route path="/en" element={<Navigate to="/en/formatter" replace />} />
        <Route path="/en/formatter" element={<Formatter />} />
        <Route path="/en/diff" element={<Diff />} />
        <Route path="/en/jsondiff" element={<Diff />} />
        <Route path="/en/excel" element={<ExcelConverter />} />
        <Route path="/en/doc-to-markdown" element={<DocToMarkdown />} />
        <Route path="/en/statediagram" element={<StateDiagram />} />
        <Route path="/en/markdown-editor" element={<MarkdownEditor />} />
        
        {/* 无语言前缀的路由（向后兼容） */}
        <Route path="/formatter" element={<Formatter />} />
        <Route path="/diff" element={<Diff />} />
        <Route path="/jsondiff" element={<Diff />} />
        <Route path="/excel" element={<ExcelConverter />} />
        <Route path="/statediagram" element={<StateDiagram />} />
        <Route path="/markdown-editor" element={<MarkdownEditor />} />
        
        {/* 404重定向 */}
        <Route path="*" element={<Navigate to="/formatter" replace />} />
      </Routes>
    </Router>
  );
}
