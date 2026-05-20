import { GetOpenIdByCodeDto, SendTemplateMessageDto, SendCustomMessageDto, GenerateQRCodeDto, WechatOAuthUrlDto, GetJSSDKConfigDto, BatchSendTemplateMessageDto } from './dto/create-wechat.dto';
export declare class WechatService {
    private readonly appId;
    private readonly appSecret;
    private readonly token;
    private readonly WECHAT_API_BASE;
    getOpenIdByCode(dto: GetOpenIdByCodeDto): Promise<{
        access_token: any;
        expires_in: any;
        refresh_token: any;
        openid: any;
        scope: any;
        unionid: any;
    }>;
    getAccessToken(appId?: string, appSecret?: string): Promise<{
        access_token: any;
        expires_in: any;
    }>;
    getUserInfo(accessToken: string, openId: string): Promise<{
        openid: any;
        nickname: any;
        sex: any;
        province: any;
        city: any;
        country: any;
        headimgurl: any;
        privilege: any;
        unionid: any;
    }>;
    sendTemplateMessage(dto: SendTemplateMessageDto): Promise<{
        msgid: any;
        success: boolean;
        message: string;
    }>;
    sendCustomMessage(dto: SendCustomMessageDto): Promise<{
        success: boolean;
        message: string;
    }>;
    generateQRCode(dto: GenerateQRCodeDto): Promise<{
        ticket: any;
        expire_seconds: any;
        url: any;
        qr_img_url: string;
    }>;
    generateOAuthUrl(dto: WechatOAuthUrlDto): Promise<{
        authorizeUrl: string;
        message: string;
    }>;
    verifySignature(signature: string, timestamp: string, nonce: string): Promise<boolean>;
    getJSSDKConfig(dto: GetJSSDKConfigDto): Promise<{
        appId: string;
        timestamp: string;
        nonceStr: string;
        signature: string;
        jsApiList: string[];
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: any;
        expires_in: any;
        refresh_token: any;
        openid: any;
        scope: any;
    }>;
    handleMessage(body: any): Promise<{
        success: boolean;
        message: string;
        reply: string;
        msgType?: undefined;
    } | {
        success: boolean;
        message: string;
        msgType: any;
        reply?: undefined;
    }>;
    private generateNonceStr;
    batchSendTemplateMessage(dto: BatchSendTemplateMessageDto): Promise<{
        success: boolean;
        message: string;
        summary: {
            total: number;
            success: number;
            failed: number;
            successRate: string;
        };
        details: any[];
        failedUsers: any[] | undefined;
    }>;
    private delay;
    private generateJSSDKSignature;
}
