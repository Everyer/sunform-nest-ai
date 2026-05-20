import { Injectable } from '@nestjs/common';
import { ConfigService } from './config.service';
import { BusinessException } from '../../../common/exceptions/business.exception';

@Injectable()
export class ProxyService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * 验证用户代理配置
   */
  async validateUserConfig(userid: string): Promise<void> {
    const config = await this.configService.findByUserId(userid);
    
    if (!config) {
      throw new BusinessException('用户未配置代理信息，请先在系统中配置代理参数');
    }

    if (!config.host) {
      throw new BusinessException('代理配置缺少目标主机地址(host)，请完善配置');
    }

    // 验证host格式
    try {
      new URL(config.host);
    } catch (error) {
      throw new BusinessException('代理主机地址格式不正确，请检查配置');
    }
  }

  /**
   * 构建目标URL
   */
  buildTargetUrl(host: string, baseUrl: string = '', apiPath: string): string {
    const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
    const cleanBaseUrl = baseUrl ? (baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`) : '';
    const cleanApiPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    
    return `${cleanHost}${cleanBaseUrl}${cleanApiPath}`;
  }

  /**
   * 清理请求头
   */
  cleanHeaders(originalHeaders: Record<string, any>): Record<string, any> {
    const headers = { ...originalHeaders };
    
    // 移除不需要转发的请求头
    const headersToRemove = [
      'host',
      'content-length',
      'authorization',
      'connection',
      'upgrade',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding'
    ];

    headersToRemove.forEach(header => {
      delete headers[header];
      delete headers[header.toLowerCase()];
    });

    return headers;
  }

  /**
   * 清理响应头
   */
  cleanResponseHeaders(originalHeaders: Record<string, any>): Record<string, any> {
    const headers = { ...originalHeaders };
    
    // 移除不需要的响应头
    const headersToRemove = [
      'transfer-encoding',
      'connection',
      'content-encoding',
      'server',
      'date'
    ];

    headersToRemove.forEach(header => {
      delete headers[header];
      delete headers[header.toLowerCase()];
    });

    return headers;
  }

  /**
   * 记录代理请求日志
   */
  logProxyRequest(
    userid: string,
    method: string,
    originalUrl: string,
    targetUrl: string,
    status?: number,
    error?: string
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      userid,
      method,
      originalUrl,
      targetUrl,
      status,
      error
    };

    if (error) {
      console.error('代理请求失败:', logData);
    } else {
      console.log('代理请求成功:', logData);
    }
  }
} 