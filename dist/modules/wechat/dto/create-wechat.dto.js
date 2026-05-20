"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchSendTemplateMessageDto = exports.GetJSSDKConfigDto = exports.WechatOAuthUrlDto = exports.GenerateQRCodeDto = exports.SendCustomMessageDto = exports.SendTemplateMessageDto = exports.GetUserInfoDto = exports.GetAccessTokenDto = exports.GetOpenIdByCodeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GetOpenIdByCodeDto {
}
exports.GetOpenIdByCodeDto = GetOpenIdByCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '微信授权code', example: '001a7f007b0d1d4f02a2097f2dcc1d00JnFh' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetOpenIdByCodeDto.prototype, "code", void 0);
class GetAccessTokenDto {
}
exports.GetAccessTokenDto = GetAccessTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '应用ID', example: 'wxxxxxxxxxxx', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetAccessTokenDto.prototype, "appId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '应用密钥', example: 'xxxxxxxxxxxxxxxxxxxxxxx', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetAccessTokenDto.prototype, "appSecret", void 0);
class GetUserInfoDto {
}
exports.GetUserInfoDto = GetUserInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Access Token', example: 'ACCESS_TOKEN' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetUserInfoDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户OpenID', example: 'oxxxxxxxxxxxxxxxxxxxxxx' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetUserInfoDto.prototype, "openId", void 0);
class SendTemplateMessageDto {
}
exports.SendTemplateMessageDto = SendTemplateMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '接收者OpenID', example: 'oxxxxxxxxxxxxxxxxxxxxxx' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendTemplateMessageDto.prototype, "touser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '模板ID', example: 'xxxxxxxxxxxxxxxxxxxxxxx' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendTemplateMessageDto.prototype, "template_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '点击模板消息跳转的URL', example: 'https://example.com', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendTemplateMessageDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '跳转小程序信息', required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SendTemplateMessageDto.prototype, "miniprogram", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '模板数据',
        example: {
            first: { value: '恭喜你购买成功！', color: '#173177' },
            keyword1: { value: '巧克力', color: '#173177' },
            keyword2: { value: '39.8元', color: '#173177' },
            keyword3: { value: '2014年9月16日', color: '#173177' },
            remark: { value: '欢迎再次购买！', color: '#173177' }
        }
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], SendTemplateMessageDto.prototype, "data", void 0);
class SendCustomMessageDto {
}
exports.SendCustomMessageDto = SendCustomMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '接收者OpenID', example: 'oxxxxxxxxxxxxxxxxxxxxxx' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendCustomMessageDto.prototype, "touser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '消息类型', example: 'text' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendCustomMessageDto.prototype, "msgtype", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '消息内容', example: { content: '你好，这是一条测试消息' } }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], SendCustomMessageDto.prototype, "message", void 0);
class GenerateQRCodeDto {
}
exports.GenerateQRCodeDto = GenerateQRCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '二维码类型', example: 'QR_LIMIT_SCENE' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerateQRCodeDto.prototype, "action_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '二维码详细信息', example: { scene: { scene_str: 'test' } } }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], GenerateQRCodeDto.prototype, "action_info", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '过期时间(秒)', example: 604800, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GenerateQRCodeDto.prototype, "expire_seconds", void 0);
class WechatOAuthUrlDto {
}
exports.WechatOAuthUrlDto = WechatOAuthUrlDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '授权后重定向的回调链接地址', example: 'https://yourdomain.com/callback' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WechatOAuthUrlDto.prototype, "redirectUri", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '授权作用域', example: 'snsapi_userinfo', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WechatOAuthUrlDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '重定向后会带上state参数', example: 'STATE', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WechatOAuthUrlDto.prototype, "state", void 0);
class GetJSSDKConfigDto {
}
exports.GetJSSDKConfigDto = GetJSSDKConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '当前页面URL', example: 'https://yourdomain.com/page' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GetJSSDKConfigDto.prototype, "url", void 0);
class BatchSendTemplateMessageDto {
}
exports.BatchSendTemplateMessageDto = BatchSendTemplateMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '接收者OpenID列表',
        example: ['oxxxxxxxxxxxxxxxxxxxxxx1', 'oxxxxxxxxxxxxxxxxxxxxxx2', 'oxxxxxxxxxxxxxxxxxxxxxx3']
    }),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], BatchSendTemplateMessageDto.prototype, "tousers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '模板ID', example: 'xxxxxxxxxxxxxxxxxxxxxxx' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BatchSendTemplateMessageDto.prototype, "template_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '点击模板消息跳转的URL', example: 'https://example.com', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BatchSendTemplateMessageDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '跳转小程序信息', required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BatchSendTemplateMessageDto.prototype, "miniprogram", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '模板数据',
        example: {
            first: { value: '恭喜你购买成功！', color: '#173177' },
            keyword1: { value: '巧克力', color: '#173177' },
            keyword2: { value: '39.8元', color: '#173177' },
            keyword3: { value: '2014年9月16日', color: '#173177' },
            remark: { value: '欢迎再次购买！', color: '#173177' }
        }
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], BatchSendTemplateMessageDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否并发发送', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BatchSendTemplateMessageDto.prototype, "concurrent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '延迟间隔(毫秒)', example: 100, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BatchSendTemplateMessageDto.prototype, "delay", void 0);
//# sourceMappingURL=create-wechat.dto.js.map