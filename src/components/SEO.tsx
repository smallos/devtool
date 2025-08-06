import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';

interface SEOProps {
  page: 'formatter' | 'diff';
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

const SEO: React.FC<SEOProps> = ({
  page,
  title,
  description,
  keywords,
  canonical,
  ogImage = '/og-image.jpg',
  ogType = 'website'
}) => {
  const { t, language } = useI18n();
  const location = useLocation();
  
  // 获取当前页面的基础路径（不含语言前缀）
  const getBasePath = () => {
    const path = location.pathname.replace(/^\/(zh|en)/, '');
    return path || '/formatter';
  };
  
  // 生成多语言URL
  const getLanguageUrls = () => {
    const basePath = getBasePath();
    const baseUrl = 'https://json-tools.dev'; // 替换为实际域名
    
    return {
      zh: `${baseUrl}/zh${basePath}`,
      en: `${baseUrl}/en${basePath}`,
      current: `${baseUrl}${location.pathname}`
    };
  };
  
  const urls = getLanguageUrls();
  
  // 使用传入的props或默认的多语言文本
  const seoTitle = title || t.seo[page].title;
  const seoDescription = description || t.seo[page].description;
  const seoKeywords = keywords || t.seo[page].keywords;
  

  return (
    <Helmet>
      {/* 基础SEO标签 */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content="JSON Tools" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={language} />
      
      {/* Open Graph标签 */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={urls.current} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={language === 'zh' ? 'zh_CN' : 'en_US'} />
      <meta property="og:site_name" content={language === 'zh' ? 'JSON工具箱' : 'JSON Tools'} />
      
      {/* Twitter Card标签 */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Hreflang tags for multi-language SEO */}
      <link rel="alternate" hrefLang="zh" href={urls.zh} />
      <link rel="alternate" hrefLang="en" href={urls.en} />
      <link rel="alternate" hrefLang="x-default" href={urls.current} />
      
      {/* 结构化数据 */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": language === 'zh' ? 'JSON工具箱' : 'JSON Tools',
          "description": seoDescription,
          "url": urls.current,
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "JSON Tools"
          }
        })}
      </script>
      
      {/* Canonical URL */}
      <link rel="canonical" href={urls.current} />
    </Helmet>
  );
};

export default SEO;