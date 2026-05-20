import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '../services/config.service';
import { JwtAuthGuard } from '../../../system/auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import axios, { AxiosRequestConfig } from 'axios';
import { BusinessException } from '../../../common/exceptions/business.exception';

@ApiTags('低代码API代理')
@Controller()
export class ProxyController {
  constructor(private readonly configService: ConfigService) {}

  @ApiBearerAuth()
  @All('lowcodeApi/*')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: '万能接口代理',
    description: '低代码平台专用代理接口，根据用户配置将请求转发到目标服务器。支持所有 HTTP 方法，支持文件上传。'
  })
  async proxyRequest(
    @Req() request: Request,
    @Res() response: Response
  ) {
    console.log('🔄 代理请求开始');
    console.log('📥 原始URL:', request.url);
    console.log('🔑 用户认证:', (request as any).user?.id);
    
    try {
      const userid = (request as any).user.id;
      const originalUrl = request.url;
      
      // 移除 /adminApi/lowcodeApi 前缀，获取真实的API路径
      const realUrl = originalUrl.replace('/adminApi/lowcodeApi', '').replace('/lowcodeApi', '');
      console.log('🎯 解析后的真实URL:', realUrl);
      
      // 获取用户的配置信息
      const userConfig = await this.configService.findByUserId(userid);
      console.log('⚙️ 用户配置:', userConfig)
      if (!userConfig) {
        throw new BusinessException('用户未配置代理信息，请先配置');
      }

      if (!userConfig.host) {
        throw new BusinessException('用户未配置目标主机地址');
      }

      // 构建目标URL
      const baseUrl = userConfig.baseUrl || '';
      const targetUrl = `${userConfig.host}${realUrl}`;

      console.log(`代理请求: ${request.method} ${originalUrl} -> ${targetUrl}`);

      // 准备请求头
      const headers: any = { ...request.headers };
      
      // 移除一些不需要的请求头
      delete headers.host;
      delete headers['content-length'];
      delete headers.authorization; // 移除原始的JWT token
      
      // 添加用户配置的token
      if (userConfig.tokenKey && userConfig.tokenValue) {
        headers[userConfig.tokenKey] = userConfig.tokenValue;
      }

      // 设置目标服务器的host
      const targetHost = new URL(userConfig.host).host;
      headers.host = targetHost;
      // 准备axios配置
      const axiosConfig: AxiosRequestConfig = {
        method: request.method.toLowerCase() as any,
        url: targetUrl,
        headers,
        params: request.query,
        responseType: 'stream',
        timeout: 30000, // 30秒超时
        maxRedirects: 5
      };
      // 处理请求体
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        // 检查是否是文件上传请求
        const contentType = request.headers['content-type'] || '';
        
        if (contentType.includes('multipart/form-data')) {
          // 文件上传请求，直接传递原始请求流
          console.log('📁 检测到文件上传请求，使用流式传输');
          axiosConfig.data = request;
                     // 保持原始的 Content-Type
           if (headers['content-type'] && axiosConfig.headers) {
             axiosConfig.headers['content-type'] = headers['content-type'];
           }

        } else {
          // 普通请求，传递请求体
          axiosConfig.data = request.body;
        }
      }

      // 发送代理请求
      const proxyResponse = await axios(axiosConfig);
      
      // 设置响应状态码
      response.status(proxyResponse.status);
      
      // 设置响应头，过滤一些不需要的头
      const responseHeaders = { ...proxyResponse.headers };
      delete responseHeaders['transfer-encoding'];
      delete responseHeaders.connection;
      delete responseHeaders['content-encoding'];
      
      Object.entries(responseHeaders).forEach(([key, value]) => {
        if (value !== undefined) {
          response.set(key, value as string);
        }
      });

      // 流式传输响应数据
      proxyResponse.data.pipe(response);

    } catch (error) {
      console.error('代理请求失败:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        // 代理的目标服务器返回了错误
        response.status(error.response.status);
        
        // 设置错误响应头
        const errorHeaders = { ...error.response.headers };
        delete errorHeaders['transfer-encoding'];
        delete errorHeaders.connection;
        
        Object.entries(errorHeaders).forEach(([key, value]) => {
          if (value !== undefined) {
            response.set(key, value as string);
          }
        });

        // 如果错误响应是流，直接pipe；否则发送数据
        if (error.response.data && typeof error.response.data.pipe === 'function') {
          error.response.data.pipe(response);
        } else {
          response.send(error.response.data);
        }
      } else if (error instanceof BusinessException) {
        // 业务异常
        response.status(400).json({
          success: false,
          message: error.message,
          code: 'CONFIG_ERROR'
        });
      } else {
        // 其他错误（网络错误等）
        console.error('网络或其他错误:', error);
        response.status(500).json({
          success: false,
          message: '代理服务器内部错误',
          code: 'PROXY_ERROR'
        });
      }
    }
  }
} 