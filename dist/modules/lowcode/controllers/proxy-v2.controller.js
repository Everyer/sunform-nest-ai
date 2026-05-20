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
exports.ProxyV2Controller = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("../services/config.service");
const jwt_auth_guard_1 = require("../../../system/auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const axios_1 = require("axios");
const business_exception_1 = require("../../../common/exceptions/business.exception");
let ProxyV2Controller = class ProxyV2Controller {
    constructor(configService) {
        this.configService = configService;
    }
    async proxyRequest(request, response) {
        try {
            const userid = request.user.id;
            const originalUrl = request.url;
            const realUrl = originalUrl.replace('/adminApi/lowcodeApi', '').replace('/lowcodeApi', '');
            const userConfig = await this.configService.findByUserId(userid);
            if (!userConfig) {
                throw new business_exception_1.BusinessException('用户未配置代理信息，请先配置');
            }
            if (!userConfig.host) {
                throw new business_exception_1.BusinessException('用户未配置目标主机地址');
            }
            const baseUrl = userConfig.baseUrl || '';
            const targetUrl = `${userConfig.host}${baseUrl}${realUrl}`;
            console.log(`代理请求: ${request.method} ${originalUrl} -> ${targetUrl}`);
            const headers = { ...request.headers };
            delete headers.host;
            delete headers['content-length'];
            delete headers.authorization;
            if (userConfig.tokenKey && userConfig.tokenValue) {
                headers[userConfig.tokenKey] = userConfig.tokenValue;
            }
            const targetHost = new URL(userConfig.host).host;
            headers.host = targetHost;
            const axiosConfig = {
                method: request.method.toLowerCase(),
                url: targetUrl,
                headers,
                params: request.query,
                responseType: 'stream',
                timeout: 30000,
                maxRedirects: 5
            };
            if (request.method !== 'GET' && request.method !== 'HEAD') {
                const contentType = request.headers['content-type'] || '';
                if (contentType.includes('multipart/form-data')) {
                    console.log('📁 检测到文件上传请求，使用流式传输');
                    axiosConfig.data = request;
                    if (headers['content-type'] && axiosConfig.headers) {
                        axiosConfig.headers['content-type'] = headers['content-type'];
                    }
                }
                else {
                    axiosConfig.data = request.body;
                }
            }
            const proxyResponse = await (0, axios_1.default)(axiosConfig);
            response.status(proxyResponse.status);
            const responseHeaders = { ...proxyResponse.headers };
            delete responseHeaders['transfer-encoding'];
            delete responseHeaders.connection;
            delete responseHeaders['content-encoding'];
            Object.entries(responseHeaders).forEach(([key, value]) => {
                if (value !== undefined) {
                    response.set(key, value);
                }
            });
            proxyResponse.data.pipe(response);
        }
        catch (error) {
            console.error('代理请求失败:', error);
            if (axios_1.default.isAxiosError(error) && error.response) {
                response.status(error.response.status);
                const errorHeaders = { ...error.response.headers };
                delete errorHeaders['transfer-encoding'];
                delete errorHeaders.connection;
                Object.entries(errorHeaders).forEach(([key, value]) => {
                    if (value !== undefined) {
                        response.set(key, value);
                    }
                });
                if (error.response.data && typeof error.response.data.pipe === 'function') {
                    error.response.data.pipe(response);
                }
                else {
                    response.send(error.response.data);
                }
            }
            else if (error instanceof business_exception_1.BusinessException) {
                response.status(400).json({
                    success: false,
                    message: error.message,
                    code: 'CONFIG_ERROR'
                });
            }
            else {
                console.error('网络或其他错误:', error);
                response.status(500).json({
                    success: false,
                    message: '代理服务器内部错误',
                    code: 'PROXY_ERROR'
                });
            }
        }
    }
};
exports.ProxyV2Controller = ProxyV2Controller;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.All)('lowcodeApi/*'),
    (0, swagger_1.ApiOperation)({
        summary: '万能接口代理 V2',
        description: '低代码平台专用代理接口 V2，支持配置 baseUrl。根据用户配置将请求转发到目标服务器。'
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProxyV2Controller.prototype, "proxyRequest", null);
exports.ProxyV2Controller = ProxyV2Controller = __decorate([
    (0, swagger_1.ApiTags)('低代码API代理 V2'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ProxyV2Controller);
//# sourceMappingURL=proxy-v2.controller.js.map