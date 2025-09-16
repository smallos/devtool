import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import type { Language } from '../i18n';
import {
  FileText,
  GitCompare,
  FileSpreadsheet,
  FileImage,
  Edit3,
  Workflow,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobile }) => {
  const { t, language, changeLanguage } = useI18n();
  const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // 导航项目配置
  const navigationItems = [
    {
      path: '/formatter',
      icon: FileText,
      label: t?.nav?.formatter || 'JSON格式化',
      description: 'JSON/XML格式化工具'
    },
    {
      path: '/diff',
      icon: GitCompare,
      label: t?.nav?.diff || 'JSON对比',
      description: '文本差异对比工具'
    },
    {
      path: '/excel',
      icon: FileSpreadsheet,
      label: t?.nav?.excel || '数据转换',
      description: 'Excel/CSV转换工具'
    },
    {
      path: '/doc-to-markdown',
      icon: FileImage,
      label: t?.nav?.docToMarkdown || '文档转Markdown',
      description: '文档转Markdown工具'
    },
    {
      path: '/markdown-editor',
      icon: Edit3,
      label: t?.nav?.markdownEditor || 'Markdown编辑器',
      description: 'Markdown编辑器'
    },
    {
      path: '/state-diagram',
      icon: Workflow,
      label: t?.nav?.stateDiagram || '状态图绘制',
      description: '状态图生成器'
    }
  ];

  // 语言选项
  const languageOptions = [
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' }
  ];

  // 检查当前路径是否激活
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 处理语言切换
  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode as Language);
    setShowLanguageMenu(false);
  };

  // 点击外部关闭语言菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLanguageMenu) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLanguageMenu]);

  return (
    <>
      {/* 移动端遮罩层 */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* 侧边栏 */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        flex flex-col
      `}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">DevTools</span>
            </div>
          )}
          
          {/* 切换按钮 */}
          <button
            onClick={onToggle}
            className={`
              p-2 rounded-lg hover:bg-gray-100 transition-colors
              ${isCollapsed ? 'mx-auto' : ''}
            `}
            title={isCollapsed ? '展开侧边栏' : '收缩侧边栏'}
          >
            {isMobile ? (
              isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />
            ) : (
              isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && onToggle()}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                )}
                {!isCollapsed && active && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 底部语言切换 */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLanguageMenu(!showLanguageMenu);
              }}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-lg
                text-gray-700 hover:bg-gray-50 transition-colors
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? '切换语言' : ''}
            >
              <Globe className="w-5 h-5 text-gray-500" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium">
                    {t?.nav?.language || '语言'}
                  </span>
                  <span className="text-lg">
                    {languageOptions.find(opt => opt.code === language)?.flag || '🇨🇳'}
                  </span>
                </>
              )}
            </button>

            {/* 语言选择菜单 */}
            {showLanguageMenu && (
              <div className={`
                absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg
                ${isCollapsed ? 'left-full ml-2 w-48' : 'left-0 right-0'}
                z-50
              `}>
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => handleLanguageChange(option.code)}
                    className={`
                      w-full flex items-center space-x-3 p-3 text-left
                      hover:bg-gray-50 transition-colors
                      ${language === option.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                      ${languageOptions.indexOf(option) === 0 ? 'rounded-t-lg' : ''}
                      ${languageOptions.indexOf(option) === languageOptions.length - 1 ? 'rounded-b-lg' : ''}
                    `}
                  >
                    <span className="text-lg">{option.flag}</span>
                    <span className="font-medium">{option.label}</span>
                    {language === option.code && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;