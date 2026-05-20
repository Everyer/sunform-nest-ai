export declare class GetOpenIdByCodeDto {
    readonly code: string;
}
export declare class GetAccessTokenDto {
    readonly appId?: string;
    readonly appSecret?: string;
}
export declare class GetUserInfoDto {
    readonly accessToken: string;
    readonly openId: string;
}
export declare class SendTemplateMessageDto {
    readonly touser: string;
    readonly template_id: string;
    readonly url?: string;
    readonly miniprogram?: {
        appid: string;
        pagepath?: string;
    };
    readonly data: Record<string, {
        value: string;
        color?: string;
    }>;
}
export declare class SendCustomMessageDto {
    readonly touser: string;
    readonly msgtype: string;
    readonly message: any;
}
export declare class GenerateQRCodeDto {
    readonly action_name: string;
    readonly action_info: any;
    readonly expire_seconds?: number;
}
export declare class WechatOAuthUrlDto {
    readonly redirectUri: string;
    readonly scope?: string;
    readonly state?: string;
}
export declare class GetJSSDKConfigDto {
    readonly url: string;
}
export declare class BatchSendTemplateMessageDto {
    readonly tousers: string[];
    readonly template_id: string;
    readonly url?: string;
    readonly miniprogram?: {
        appid: string;
        pagepath?: string;
    };
    readonly data: Record<string, {
        value: string;
        color?: string;
    }>;
    readonly concurrent?: boolean;
    readonly delay?: number;
}
