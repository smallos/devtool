import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'JSON 工具箱 - 专业的JSON处理工具',
  description = '专业的JSON格式化、对比和管理工具，支持语法高亮、错误检测、历史记录等功能',
  keywords = 'JSON格式化,JSON对比,JSON工具,JSON验证,JSON压缩,JSON转义,在线JSON工具',
  canonical
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
    </Helmet>
  );
};

export default SEO;