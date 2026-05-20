"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatService = void 0;
const common_1 = require("@nestjs/common");
const business_exception_1 = require("../../common/exceptions/business.exception");
const axios_1 = require("axios");
const crypto = require("crypto");
let WechatService = class WechatService {
    constructor() {
        this.appId = process.env.WECHAT_APP_ID || 'your_app_id';
        this.appSecret = process.env.WECHAT_APP_SECRET || 'your_app_secret';
        this.token = process.env.WECHAT_TOKEN || 'your_token';
        this.WECHAT_API_BASE = 'https://api.weixin.qq.com';
    }
    async getOpenIdByCode(dto) {
        try {
            const url = `${this.WECHAT_API_BASE}/sns/oauth2/access_token`;
            const params = {
                appid: this.appId,
                secret: this.appSecret,
                code: dto.code,
                grant_type: 'authorization_code'
            };
            const response = await axios_1.default.get(url, { params });
            if (response.data.errcode) {
                throw new business_exception_1.BusinessException(`微信接口错误: ${response.data.errmsg}`);
            }
            return {
                access_token: response.data.access_token,
                expires_in: response.data.expires_in,
                refresh_token: response.data.refresh_token,
                openid: response.data.openid,
                scope: response.data.scope,
                unionid: response.data.unionid
            };
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('获取OpenID失败');
        }
    }
    async getAccessToken(appId, appSecret) {
        try {
            const url = `${this.WECHAT_API_BASE}/cgi-bin/token`;
            const params = {
                grant_type: 'client_credential',
                appid: appId || this.appId,
                secret: appSecret || this.appSecret
            };
            const response = await axios_1.default.get(url, { params });
            if (response.data.errcode) {
                throw new business_exception_1.BusinessException(`微信接口错误: ${response.data.errmsg}`);
            }
            return {
                access_token: response.data.access_token,
                expires_in: response.data.expires_in
            };
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('获取Access Token失败');
        }
    }
    async getUserInfo(accessToken, openId) {
        try {
            const url = `${this.WECHAT_API_BASE}/sns/userinfo`;
            const params = {
                access_token: accessToken,
                openid: openId,
                lang: 'zh_CN'
            };
            const response = await axios_1.default.get(url, { params });
            if (response.data.errcode) {
                throw new business_exception_1.BusinessException(`微信接口错误: ${response.data.errmsg}`);
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
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('获取用户信息失败');
        }
    }
    async sendTemplateMessage(dto) {
        try {
            const tokenResult = await this.getAccessToken();
            const url = `${this.WECHAT_API_BASE}/cgi-bin/message/template/send?access_token=${tokenResult.access_token}`;
            const response = await axios_1.default.post(url, dto);
            if (response.data.errcode !== 0) {
                throw new business_exception_1.BusinessException(`发送模板消息失败: ${response.data.errmsg}`);
            }
            return {
                msgid: response.data.msgid,
                success: true,
                message: '模板消息发送成功'
            };
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('发送模板消息失败');
        }
    }
    async sendCustomMessage(dto) {
        try {
            const tokenResult = await this.getAccessToken();
            const url = `${this.WECHAT_API_BASE}/cgi-bin/message/custom/send?access_token=${tokenResult.access_token}`;
            const messageBody = {
                touser: dto.touser,
                msgtype: dto.msgtype,
                [dto.msgtype]: dto.message
            };
            const response = await axios_1.default.post(url, messageBody);
            if (response.data.errcode !== 0) {
                throw new business_exception_1.BusinessException(`发送客服消息失败: ${response.data.errmsg}`);
            }
            return {
                success: true,
                message: '客服消息发送成功'
            };
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('发送客服消息失败');
        }
    }
    async generateQRCode(dto) {
        try {
            const tokenResult = await this.getAccessToken();
            const url = `${this.WECHAT_API_BASE}/cgi-bin/qrcode/create?access_token=${tokenResult.access_token}`;
            const response = await axios_1.default.post(url, dto);
            if (response.data.errcode) {
                throw new business_exception_1.BusinessException(`生成二维码失败: ${response.data.errmsg}`);
            }
            return {
                ticket: response.data.ticket,
                expire_seconds: response.data.expire_seconds,
                url: response.data.url,
                qr_img_url: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(response.data.ticket)}`
            };
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('生成二维码失败');
        }
    }
    async generateOAuthUrl(dto) {
        const scope = dto.scope || 'snsapi_userinfo';
        const state = dto.state || 'STATE';
        const encodedRedirectUri = encodeURIComponent(dto.redirectUri);
        const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.appId}&redirect_uri=${encodedRedirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
        return {
            authorizeUrl: url,
            message: '授权链接生成成功'
        };
    }
    async verifySignature(signature, timestamp, nonce) {
        const tmpArr = [this.token, timestamp, nonce];
        tmpArr.sort();
        const tmpStr = tmpArr.join('');
        const sha1 = crypto.createHash('sha1').update(tmpStr).digest('hex');
        return sha1 === signature;
    }
    async getJSSDKConfig(dto) {
        try {
            const tokenResult = await this.getAccessToken();
            const ticketUrl = `${this.WECHAT_API_BASE}/cgi-bin/ticket/getticket?access_token=${tokenResult.access_token}&type=jsapi`;
            const ticketResponse = await axios_1.default.get(ticketUrl);
            if (ticketResponse.data.errcode !== 0) {
                throw new business_exception_1.BusinessException(`获取jsapi_ticket失败: ${ticketResponse.data.errmsg}`);
            }
            const jsapi_ticket = ticketResponse.data.ticket;
            const nonceStr = this.generateNonceStr();
            const timestamp = Math.floor(Date.now() / 1000).toString();
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
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('获取JSSDK配置失败');
        }
    }
    async refreshAccessToken(refreshToken) {
        try {
            const url = `${this.WECHAT_API_BASE}/sns/oauth2/refresh_token`;
            const params = {
                appid: this.appId,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            };
            const response = await axios_1.default.get(url, { params });
            if (response.data.errcode) {
                throw new business_exception_1.BusinessException(`微信接口错误: ${response.data.errmsg}`);
            }
            return {
                access_token: response.data.access_token,
                expires_in: response.data.expires_in,
                refresh_token: response.data.refresh_token,
                openid: response.data.openid,
                scope: response.data.scope
            };
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('刷新Access Token失败');
        }
    }
    async handleMessage(body) {
        try {
            console.log('收到微信消息:', body);
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
        }
        catch (error) {
            throw new business_exception_1.BusinessException('处理消息失败');
        }
    }
    generateNonceStr() {
        return Math.random().toString(36).substr(2, 15);
    }
    async batchSendTemplateMessage(dto) {
        try {
            const { tousers, template_id, url, miniprogram, data, concurrent = false, delay = 100 } = dto;
            const tokenResult = await this.getAccessToken();
            const apiUrl = `${this.WECHAT_API_BASE}/cgi-bin/message/template/send?access_token=${tokenResult.access_token}`;
            const results = [];
            const failedUsers = [];
            const successUsers = [];
            if (concurrent) {
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
                        const response = await axios_1.default.post(apiUrl, messageData);
                        if (response.data.errcode === 0) {
                            successUsers.push(touser);
                            return {
                                touser,
                                success: true,
                                msgid: response.data.msgid,
                                message: '发送成功'
                            };
                        }
                        else {
                            failedUsers.push({ touser, error: response.data.errmsg });
                            return {
                                touser,
                                success: false,
                                error: response.data.errmsg,
                                errcode: response.data.errcode
                            };
                        }
                    }
                    catch (error) {
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
            }
            else {
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
                        const response = await axios_1.default.post(apiUrl, messageData);
                        if (response.data.errcode === 0) {
                            successUsers.push(touser);
                            results.push({
                                touser,
                                success: true,
                                msgid: response.data.msgid,
                                message: '发送成功'
                            });
                        }
                        else {
                            failedUsers.push({ touser, error: response.data.errmsg });
                            results.push({
                                touser,
                                success: false,
                                error: response.data.errmsg,
                                errcode: response.data.errcode
                            });
                        }
                        if (delay > 0 && touser !== tousers[tousers.length - 1]) {
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                    catch (error) {
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
        }
        catch (error) {
            if (error instanceof business_exception_1.BusinessException) {
                throw error;
            }
            throw new business_exception_1.BusinessException('批量发送模板消息失败');
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    generateJSSDKSignature(jsapi_ticket, noncestr, timestamp, url) {
        const str = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
        return crypto.createHash('sha1').update(str).digest('hex');
    }
};
exports.WechatService = WechatService;
exports.WechatService = WechatService = __decorate([
    (0, common_1.Injectable)()
], WechatService);
//# sourceMappingURL=wechat.service.js.map