import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions/business.exception';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  GetOpenIdByCodeDto,
  SendTemplateMessageDto,
  SendCustomMessageDto,
  GenerateQRCodeDto,
  WechatOAuthUrlDto,
  GetJSSDKConfigDto,
  BatchSendTemplateMessageDto
} from './dto/create-wechat.dto';

@Injectable()
export class WechatService {
  private readonly appId = process.env.WECHAT_APP_ID || 'your_app_id';
  private readonly appSecret = process.env.WECHAT_APP_SECRET || 'your_app_secret';
  private readonly token = process.env.WECHAT_TOKEN || 'your_token';
  // 微信API基础URL
  private readonly WECHAT_API_BASE = 'https://api.weixin.qq.com';

  /**
   * 通过code换取网页授权access_token和openid
   */
  async getOpenIdByCode(dto: GetOpenIdByCodeDto) {
    try {
      const url = `${this.WECHAT_API_BASE}/sns/oauth2/access_token`;
      const params = {
        appid: this.appId,
        secret: this.appSecret,
        code: dto.code,
        grant_type: 'authorization_code'
      };

      const response = await axios.get(url, { params });

      if (response.data.errcode) {
        throw new BusinessException(`微信接口错误: ${response.data.errmsg}`);
      }

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token,
        openid: response.data.openid,
        scope: response.data.scope,
        unionid: response.data.unionid
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('获取OpenID失败');
    }
  }

  /**
   * 获取基础支持的access_token
   */
  async getAccessToken(appId?: string, appSecret?: string) {
    try {
      const url = `${this.WECHAT_API_BASE}/cgi-bin/token`;
      const params = {
        grant_type: 'client_credential',
        appid: appId || this.appId,
        secret: appSecret || this.appSecret
      };

      const response = await axios.get(url, { params });

      if (response.data.errcode) {
        throw new BusinessException(`微信接口错误: ${response.data.errmsg}`);
      }

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('获取Access Token失败');
    }
  }

  /**
   * 获取用户基本信息(需要用户授权)
   */
  async getUserInfo(accessToken: string, openId: string) {
    try {
      const url = `${this.WECHAT_API_BASE}/sns/userinfo`;
      const params = {
        access_token: accessToken,
        openid: openId,
        lang: 'zh_CN'
      };

      const response = await axios.get(url, { params });

      if (response.data.errcode) {
        throw new BusinessException(`微信接口错误: ${response.data.errmsg}`);
      }

      return {
        openid: response.data.openid,
        nickname: response.data.nickname,
        sex: response.data.sex,
        province: response.data.province,
        city: response.data.city,
        country: response.data.country,
        headimgurl: response.data.headimgurl,
        privilege: response.data.privilege,
        unionid: response.data.unionid
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('获取用户信息失败');
    }
  }

  /**
   * 发送模板消息
   */
  async sendTemplateMessage(dto: SendTemplateMessageDto) {
    try {
      // 先获取Access Token
      const tokenResult = await this.getAccessToken();

      const url = `${this.WECHAT_API_BASE}/cgi-bin/message/template/send?access_token=${tokenResult.access_token}`;

      const response = await axios.post(url, dto);

      if (response.data.errcode !== 0) {
        throw new BusinessException(`发送模板消息失败: ${response.data.errmsg}`);
      }

      return {
        msgid: response.data.msgid,
        success: true,
        message: '模板消息发送成功'
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('发送模板消息失败');
    }
  }

  /**
   * 发送客服消息
   */
  async sendCustomMessage(dto: SendCustomMessageDto) {
    try {
      const tokenResult = await this.getAccessToken();

      const url = `${this.WECHAT_API_BASE}/cgi-bin/message/custom/send?access_token=${tokenResult.access_token}`;

      // 构建消息体
      const messageBody = {
        touser: dto.touser,
        msgtype: dto.msgtype,
        [dto.msgtype]: dto.message
      };

      const response = await axios.post(url, messageBody);

      if (response.data.errcode !== 0) {
        throw new BusinessException(`发送客服消息失败: ${response.data.errmsg}`);
      }

      return {
        success: true,
        message: '客服消息发送成功'
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('发送客服消息失败');
    }
  }

  /**
   * 生成带参数的二维码
   */
  async generateQRCode(dto: GenerateQRCodeDto) {
    try {
      const tokenResult = await this.getAccessToken();

      const url = `${this.WECHAT_API_BASE}/cgi-bin/qrcode/create?access_token=${tokenResult.access_token}`;

      const response = await axios.post(url, dto);

      if (response.data.errcode) {
        throw new BusinessException(`生成二维码失败: ${response.data.errmsg}`);
      }

      return {
        ticket: response.data.ticket,
        expire_seconds: response.data.expire_seconds,
        url: response.data.url,
        qr_img_url: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(response.data.ticket)}`
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('生成二维码失败');
    }
  }

  /**
   * 生成微信授权链接
   */
  async generateOAuthUrl(dto: WechatOAuthUrlDto) {
    const scope = dto.scope || 'snsapi_userinfo';
    const state = dto.state || 'STATE';
    const encodedRedirectUri = encodeURIComponent(dto.redirectUri);

    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;

    return {
      authorizeUrl: url,
      message: '授权链接生成成功'
    };
  }

  /**
   * 验证微信服务器签名
   */
  async verifySignature(signature: string, timestamp: string, nonce: string): Promise<boolean> {
    const tmpArr = [this.token, timestamp, nonce];
    tmpArr.sort();
    const tmpStr = tmpArr.join('');
    const sha1 = crypto.createHash('sha1').update(tmpStr).digest('hex');
    return sha1 === signature;
  }

  /**
   * 获取JSSDK配置参数
   */
  async getJSSDKConfig(dto: GetJSSDKConfigDto) {
    try {
      const tokenResult = await this.getAccessToken();

      // 获取jsapi_ticket
      const ticketUrl = `${this.WECHAT_API_BASE}/cgi-bin/ticket/getticket?access_token=${tokenResult.access_token}&type=jsapi`;
      const ticketResponse = await axios.get(ticketUrl);

      if (ticketResponse.data.errcode !== 0) {
        throw new BusinessException(`获取jsapi_ticket失败: ${ticketResponse.data.errmsg}`);
      }

      const jsapi_ticket = ticketResponse.data.ticket;
      const nonceStr = this.generateNonceStr();
      const timestamp = Math.floor(Date.now() / 1000).toString();

      // 生成签名
      const signature = this.generateJSSDKSignature(jsapi_ticket, nonceStr, timestamp, dto.url);

      return {
        appId: this.appId,
        timestamp,
        nonceStr,
        signature,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareTimeline',
          'onMenuShareAppMessage',
          'chooseImage',
          'uploadImage',
          'downloadImage',
          'previewImage',
          'getLocation',
          'openLocation'
        ]
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('获取JSSDK配置失败');
    }
  }

  /**
   * 刷新网页授权access_token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      const url = `${this.WECHAT_API_BASE}/sns/oauth2/refresh_token`;
      const params = {
        appid: this.appId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      };

      const response = await axios.get(url, { params });

      if (response.data.errcode) {
        throw new BusinessException(`微信接口错误: ${response.data.errmsg}`);
      }

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        refresh_token: response.data.refresh_token,
        openid: response.data.openid,
        scope: response.data.scope
      };
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('刷新Access Token失败');
    }
  }

  /**
   * 处理微信消息推送
   */
  async handleMessage(body: any) {
    try {
      // 这里可以根据消息类型处理不同的逻辑
      console.log('收到微信消息:', body);

      // 简单的自动回复示例
      if (body.MsgType === 'text') {
        return {
          success: true,
          message: '文本消息已接收',
          reply: `你说的是：${body.Content}`
        };
      }

      return {
        success: true,
        message: '消息已接收',
        msgType: body.MsgType
      };
    } catch (error) {
      throw new BusinessException('处理消息失败');
    }
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(): string {
    return Math.random().toString(36).substr(2, 15);
  }

  /**
   * 批量发送模板消息
   */
  async batchSendTemplateMessage(dto: BatchSendTemplateMessageDto) {
    try {
      const { tousers, template_id, url, miniprogram, data, concurrent = false, delay = 100 } = dto;

      // 先获取Access Token
      const tokenResult = await this.getAccessToken();
      const apiUrl = `${this.WECHAT_API_BASE}/cgi-bin/message/template/send?access_token=${tokenResult.access_token}`;

      const results: any[] = [];
      const failedUsers: any[] = [];
      const successUsers: string[] = [];

      if (concurrent) {
        // 并发发送（速度快，但可能触发频率限制）
        const promises = tousers.map(async (touser) => {
          try {
            const messageData = {
              touser,
              template_id,
              url,
              miniprogram,
              data
            };
            if (messageData.miniprogram) {
              messageData.miniprogram.pagepath = messageData.miniprogram.pagepath?.includes('?') ? messageData.miniprogram.pagepath + '&openid=' + touser : messageData.miniprogram.pagepath + '?openid=' + touser;
            }
            const response = await axios.post(apiUrl, messageData);

            if (response.data.errcode === 0) {
              successUsers.push(touser);
              return {
                touser,
                success: true,
                msgid: response.data.msgid,
                message: '发送成功'
              };
            } else {
              failedUsers.push({ touser, error: response.data.errmsg });
              return {
                touser,
                success: false,
                error: response.data.errmsg,
                errcode: response.data.errcode
              };
            }
          } catch (error) {
            failedUsers.push({ touser, error: error.message });
            return {
              touser,
              success: false,
              error: error.message
            };
          }
        });

        const responses = await Promise.allSettled(promises);
        results.push(...responses.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' }));

      } else {
        // 串行发送（稳定，避免频率限制）
        for (const touser of tousers) {
          try {
            const messageData = {
              touser,
              template_id,
              url,
              miniprogram,
              data
            };
            if (messageData.miniprogram) {
              messageData.miniprogram.pagepath = messageData.miniprogram.pagepath?.includes('?') ? messageData.miniprogram.pagepath + '&openid=' + touser : messageData.miniprogram.pagepath + '?openid=' + touser;
            }
            const response = await axios.post(apiUrl, messageData);

            if (response.data.errcode === 0) {
              successUsers.push(touser);
              results.push({
                touser,
                success: true,
                msgid: response.data.msgid,
                message: '发送成功'
              });
            } else {
              failedUsers.push({ touser, error: response.data.errmsg });
              results.push({
                touser,
                success: false,
                error: response.data.errmsg,
                errcode: response.data.errcode
              });
            }

            // 添加延迟避免频率限制
            if (delay > 0 && touser !== tousers[tousers.length - 1]) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }

          } catch (error) {
            failedUsers.push({ touser, error: error.message });
            results.push({
              touser,
              success: false,
              error: error.message
            });
          }
        }
      }

      return {
        success: true,
        message: '批量发送完成',
        summary: {
          total: tousers.length,
          success: successUsers.length,
          failed: failedUsers.length,
          successRate: `${((successUsers.length / tousers.length) * 100).toFixed(2)}%`
        },
        details: results,
        failedUsers: failedUsers.length > 0 ? failedUsers : undefined
      };

    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('批量发送模板消息失败');
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成JSSDK签名
   */
  private generateJSSDKSignature(jsapi_ticket: string, noncestr: string, timestamp: string, url: string): string {
    const str = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
    return crypto.createHash('sha1').update(str).digest('hex');
  }
}
