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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wechat_service_1 = require("./wechat.service");
const create_wechat_dto_1 = require("./dto/create-wechat.dto");
let WechatController = class WechatController {
    constructor(wechatService) {
        this.wechatService = wechatService;
    }
    async getOpenIdByCode(dto) {
        return await this.wechatService.getOpenIdByCode(dto);
    }
    async getAccessToken(dto) {
        return await this.wechatService.getAccessToken(dto.appId, dto.appSecret);
    }
    async getUserInfo(dto) {
        return await this.wechatService.getUserInfo(dto.accessToken, dto.openId);
    }
    async sendTemplateMessage(dto) {
        return await this.wechatService.sendTemplateMessage(dto);
    }
    async sendCustomMessage(dto) {
        return await this.wechatService.sendCustomMessage(dto);
    }
    async generateQRCode(dto) {
        return await this.wechatService.generateQRCode(dto);
    }
    async generateOAuthUrl(dto) {
        return await this.wechatService.generateOAuthUrl(dto);
    }
    async getJSSDKConfig(dto) {
        return await this.wechatService.getJSSDKConfig(dto);
    }
    async refreshAccessToken(dto) {
        return await this.wechatService.refreshAccessToken(dto.refreshToken);
    }
    async verifyWechatSignature(signature, timestamp, nonce, echostr) {
        const isValid = await this.wechatService.verifySignature(signature, timestamp, nonce);
        if (isValid) {
            return echostr;
        }
        return 'Invalid signature';
    }
    async receiveMessage(body) {
        return await this.wechatService.handleMessage(body);
    }
    async handleWechatMessage(body, contentType) {
        if (contentType && contentType.includes('text/xml')) {
            console.log('收到XML消息:', body);
            return 'success';
        }
        return await this.wechatService.handleMessage(body);
    }
    async batchSendTemplateMessage(dto) {
        return await this.wechatService.batchSendTemplateMessage(dto);
    }
};
exports.WechatController = WechatController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '通过code换取openid和access_token' }),
    (0, common_1.Post)('getOpenIdByCode'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.GetOpenIdByCodeDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "getOpenIdByCode", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取基础支持的access_token' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('getAccessToken'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.GetAccessTokenDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "getAccessToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取用户基本信息' }),
    (0, common_1.Post)('getUserInfo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.GetUserInfoDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "getUserInfo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '发送模板消息' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('sendTemplateMessage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.SendTemplateMessageDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "sendTemplateMessage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '发送客服消息' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('sendCustomMessage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.SendCustomMessageDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "sendCustomMessage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '生成带参数二维码' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('generateQRCode'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.GenerateQRCodeDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "generateQRCode", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '生成微信授权链接' }),
    (0, common_1.Post)('generateOAuthUrl'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.WechatOAuthUrlDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "generateOAuthUrl", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取JSSDK配置参数' }),
    (0, common_1.Post)('getJSSDKConfig'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.GetJSSDKConfigDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "getJSSDKConfig", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '刷新网页授权access_token' }),
    (0, common_1.Post)('refreshAccessToken'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "refreshAccessToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '微信服务器验证接口' }),
    (0, common_1.Get)('verify'),
    __param(0, (0, common_1.Query)('signature')),
    __param(1, (0, common_1.Query)('timestamp')),
    __param(2, (0, common_1.Query)('nonce')),
    __param(3, (0, common_1.Query)('echostr')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "verifyWechatSignature", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '接收微信消息推送' }),
    (0, common_1.Post)('receive'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "receiveMessage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '微信消息推送处理(XML格式)' }),
    (0, common_1.Post)('message'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('content-type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "handleWechatMessage", null);
__decorate([
    (0, common_1.Post)('batchSendTemplateMessage'),
    (0, swagger_1.ApiOperation)({
        summary: '批量发送模板消息',
        description: '一次性向多个用户发送相同的模板消息。支持串行发送（推荐）和并发发送两种模式。'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '批量发送完成',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                summary: {
                    type: 'object',
                    properties: {
                        total: { type: 'number', description: '总发送数量' },
                        success: { type: 'number', description: '成功数量' },
                        failed: { type: 'number', description: '失败数量' },
                        successRate: { type: 'string', description: '成功率' }
                    }
                },
                details: { type: 'array', description: '详细发送结果' },
                failedUsers: { type: 'array', description: '失败用户列表' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_wechat_dto_1.BatchSendTemplateMessageDto]),
    __metadata("design:returntype", Promise)
], WechatController.prototype, "batchSendTemplateMessage", null);
exports.WechatController = WechatController = __decorate([
    (0, swagger_1.ApiTags)('微信公众号'),
    (0, common_1.Controller)('wechat'),
    __metadata("design:paramtypes", [wechat_service_1.WechatService])
], WechatController);
//# sourceMappingURL=wechat.controller.js.map