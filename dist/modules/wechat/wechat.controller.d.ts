import { WechatService } from './wechat.service';
import { GetOpenIdByCodeDto, GetAccessTokenDto, SendTemplateMessageDto, SendCustomMessageDto, GenerateQRCodeDto, WechatOAuthUrlDto, GetJSSDKConfigDto, GetUserInfoDto, BatchSendTemplateMessageDto } from './dto/create-wechat.dto';
export declare class WechatController {
    private readonly wechatService;
    constructor(wechatService: WechatService);
    getOpenIdByCode(dto: GetOpenIdByCodeDto): Promise<{
        access_token: any;
        expires_in: any;
        refresh_token: any;
        openid: any;
        scope: any;
        unionid: any;
    }>;
    getAccessToken(dto: GetAccessTokenDto): Promise<{
        access_token: any;
        expires_in: any;
    }>;
    getUserInfo(dto: GetUserInfoDto): Promise<{
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
    getJSSDKConfig(dto: GetJSSDKConfigDto): Promise<{
        appId: string;
        timestamp: string;
        nonceStr: string;
        signature: string;
        jsApiList: string[];
    }>;
    refreshAccessToken(dto: {
        refreshToken: string;
    }): Promise<{
        access_token: any;
        expires_in: any;
        refresh_token: any;
        openid: any;
        scope: any;
    }>;
    verifyWechatSignature(signature: string, timestamp: string, nonce: string, echostr: string): Promise<string>;
    receiveMessage(body: any): Promise<{
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
    handleWechatMessage(body: string, contentType: string): Promise<{
        success: boolean;
        message: string;
        reply: string;
        msgType?: undefined;
    } | {
        success: boolean;
        message: string;
        msgType: any;
        reply?: undefined;
    } | "success">;
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
}
