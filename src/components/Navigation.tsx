import React, { useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { FileText, GitCompare, Globe, ChevronDown, Workflow } from "lucide-react";
import { useI18n } from "../hooks/useI18n";
import { Language, LANGUAGE_NAMES } from "../i18n";

const Navigation: React.FC = () => {
  const { t, language, changeLanguage } = useI18n();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const location = useLocation();
  
  // 获取当前路径对应的多语言路径
  const getLocalizedPath = (path: string, lang: string) => {
    // 如果路径已经有语言前缀，替换它
    const pathWithoutLang = path.replace(/^\/(zh|en)/, '');
    return `/${lang}${pathWithoutLang || '/formatter'}`;
  };
  
  // 获取当前页面的基础路径（不含语言前缀）
  const getCurrentBasePath = () => {
    return location.pathname.replace(/^\/(zh|en)/, '') || '/formatter';
  };

  const navigationItems = [
    { key: 'formatter', label: t.nav.formatter, path: getLocalizedPath('/formatter', language) },
    { key: 'diff', label: t.nav.diff, path: getLocalizedPath('/diff', language) },
    { key: 'excel', label: t.nav.excel, path: getLocalizedPath('/excel', language) },
    { key: 'stateDiagram', label: t.nav.stateDiagram, path: getLocalizedPath('/statediagram', language) },
  ];

  const handleLanguageChange = (newLanguage: 'zh' | 'en') => {
    changeLanguage(newLanguage);
    setIsLanguageDropdownOpen(false);
    
    // 切换语言时更新URL
    const currentBasePath = getCurrentBasePath();
    const newPath = getLocalizedPath(currentBasePath, newLanguage);
    window.history.pushState(null, '', newPath);
    
    // 触发路由更新
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <nav className="bg-bj-bg-card border-b border-bj-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold text-bj-text-primary hover:text-bj-accent-blue transition-colors">
              {language === 'zh' ? 'JSON工具箱' : 'JSON Toolbox'}
            </Link>
          </div>

          {/* Navigation Items and Language Switcher */}
          <div className="flex items-center space-x-1">
            {/* Navigation Items */}
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.key === 'formatter' && (location.pathname === '/' || location.pathname.endsWith('/formatter'))) ||
                             (item.key === 'diff' && location.pathname.endsWith('/diff')) ||
                             (item.key === 'stateDiagram' && location.pathname.endsWith('/statediagram'));
              
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive 
                      ? 'text-bj-accent-blue bg-bj-accent-blue/10 border border-bj-accent-blue/20' 
                      : 'text-bj-text-secondary hover:text-bj-text-primary hover:bg-bj-bg-secondary'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            
            {/* Language Switcher */}
            <div className="relative ml-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-bj-text-secondary" />
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value as Language)}
                  className="bg-transparent border border-bj-border rounded-md px-2 py-1 text-sm text-bj-text-primary focus:outline-none focus:ring-2 focus:ring-bj-accent-blue focus:border-transparent cursor-pointer hover:bg-bj-bg-secondary transition-colors"
                >
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <option key={code} value={code} className="bg-bj-bg-card text-bj-text-primary">
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;