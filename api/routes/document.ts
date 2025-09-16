import express, { Request, Response } from 'express';
import multer from 'multer';
import textract from 'textract';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { promisify } from 'util';
import { parseOfficeAsync } from 'officeparser';
import * as iconv from 'iconv-lite';
import quotedPrintable from 'quoted-printable';

const router = express.Router();

// 辅助函数：处理各种编码格式的文本
function processEncodedText(text: string): string {
  try {
    // 检查是否包含quoted-printable编码
    if (text.includes('=E') || text.includes('=3D') || text.includes('Content-Transfer-Encoding: quoted-printable')) {
      console.log('检测到quoted-printable编码，开始解码');
      
      // 提取HTML内容部分
      const htmlMatch = text.match(/<html[\s\S]*?<\/html>/i);
      if (htmlMatch) {
        let htmlContent = htmlMatch[0];
        
        // 解码quoted-printable并转换为UTF-8
        const decodedBytes = quotedPrintable.decode(htmlContent);
        htmlContent = Buffer.from(decodedBytes, 'binary').toString('utf8');
        
        // 移除HTML标签，保留文本内容
        htmlContent = htmlContent
          .replace(/<[^>]*>/g, ' ')  // 移除HTML标签
          .replace(/&nbsp;/g, ' ')   // 替换HTML实体
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')      // 合并多个空格
          .trim();
          
        return htmlContent;
      }
    }
    
    // 检查是否包含URL编码的中文字符
    if (text.includes('%E') || text.includes('=E')) {
      try {
        // 尝试URL解码
        const urlDecoded = decodeURIComponent(text.replace(/=/g, '%'));
        if (urlDecoded !== text) {
          return urlDecoded;
        }
      } catch (e) {
        console.log('URL解码失败，继续其他处理');
      }
    }
    
    return text;
  } catch (error) {
    console.error('文本编码处理失败:', error);
    return text;
  }
}

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/pdf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式'));
    }
  }
});

// 处理DOC文件转换
router.post('/convert-doc', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: '未找到上传的文件'
      });
    }

    const { buffer, mimetype, originalname } = req.file;
    let markdown = '';

    if (mimetype === 'application/msword') {
      // 处理DOC文件 - 使用 officeparser
      console.log('开始使用officeparser处理DOC文件');
      
      try {
        const extractedText = await parseOfficeAsync(buffer, {
          outputErrorToConsole: true
        });
        
        console.log('Officeparser原始输出长度:', extractedText?.length || 0);
        console.log('Officeparser原始输出前100字符:', extractedText ? extractedText.substring(0, 100) : 'empty');
        
        if (!extractedText || extractedText.trim().length === 0) {
          console.log('Officeparser处理失败: 未能提取到文本内容');
          throw new Error('Officeparser未能提取到文本内容');
        }
        
        // 首先处理编码问题
        let processedText = processEncodedText(extractedText);
        console.log('编码处理后文本长度:', processedText.length);
        console.log('编码处理后前200字符:', processedText.substring(0, 200));
        
        // 清理和格式化文本
        let text = processedText
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/[ \t]+/g, ' ')
          .trim();
        
        // 简单的文本到Markdown转换
        markdown = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .join('\n\n');
          
        console.log('最终markdown长度:', markdown.length);
          
      } catch (officeparserError) {
        console.error('Officeparser处理失败:', officeparserError);
        
        // 使用textract作为fallback
        console.log('尝试使用textract作为fallback处理DOC文件');
        try {
          const textractFromBuffer = promisify(textract.fromBufferWithMime);
          const options = {
            preserveLineBreaks: true,
            preserveOnlyMultipleLineBreaks: false,
            exec: {
              maxBuffer: 1000 * 1024 // 1MB buffer
            }
          };
          
          let text = await textractFromBuffer(mimetype, buffer, options);
          
          if (!text || text.trim().length === 0) {
            throw new Error('Textract未能提取到文本内容');
          }
          
          // 首先处理编码问题
          text = processEncodedText(text);
          console.log('Textract编码处理后文本长度:', text.length);
          
          text = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
          
          markdown = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n\n');
            
        } catch (textractError) {
          console.error('Textract fallback也失败:', textractError);
          // 尝试使用mammoth作为最后fallback
          try {
            console.log('尝试使用mammoth作为最后fallback处理DOC文件');
            const result = await mammoth.extractRawText({ buffer });
            if (result.value && result.value.trim().length > 0) {
              // 首先处理编码问题
              let processedText = processEncodedText(result.value);
              console.log('Mammoth编码处理后文本长度:', processedText.length);
              
              markdown = processedText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n\n');
              console.log('Mammoth fallback成功，文本长度:', markdown.length);
            } else {
              throw new Error('Mammoth fallback也未能提取到内容');
            }
          } catch (mammothError) {
            console.error('Mammoth fallback也失败:', mammothError);
            throw new Error('DOC文件处理失败，请尝试将文件转换为DOCX格式后重新上传');
          }
        }
      }
        
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // 处理DOCX文件
      const result = await mammoth.convertToHtml({ buffer });
      
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
      
      markdown = turndownService.turndown(result.value);
    }

    res.json({
      success: true,
      data: {
        markdown,
        originalFileName: originalname,
        fileType: mimetype === 'application/msword' ? 'doc' : 'docx'
      }
    });

  } catch (error) {
    console.error('文档转换错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'DOC文件转换失败'
    });
  }
});

export default router;