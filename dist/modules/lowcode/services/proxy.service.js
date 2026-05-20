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
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const config_service_1 = require("./config.service");
const business_exception_1 = require("../../../common/exceptions/business.exception");
let ProxyService = class ProxyService {
    constructor(configService) {
        this.configService = configService;
    }
    async validateUserConfig(userid) {
        const config = await this.configService.findByUserId(userid);
        if (!config) {
            throw new business_exception_1.BusinessException('用户未配置代理信息，请先在系统中配置代理参数');
        }
        if (!config.host) {
            throw new business_exception_1.BusinessException('代理配置缺少目标主机地址(host)，请完善配置');
        }
        try {
            new URL(config.host);
        }
        catch (error) {
            throw new business_exception_1.BusinessException('代理主机地址格式不正确，请检查配置');
        }
    }
    buildTargetUrl(host, baseUrl = '', apiPath) {
        const cleanHost = host.endsWith('/') ? host.slice(0, -1) : host;
        const cleanBaseUrl = baseUrl ? (baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`) : '';
        const cleanApiPath = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
        return `${cleanHost}${cleanBaseUrl}${cleanApiPath}`;
    }
    cleanHeaders(originalHeaders) {
        const headers = { ...originalHeaders };
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
    cleanResponseHeaders(originalHeaders) {
        const headers = { ...originalHeaders };
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
    logProxyRequest(userid, method, originalUrl, targetUrl, status, error) {
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
        }
        else {
            console.log('代理请求成功:', logData);
        }
    }
};
exports.ProxyService = ProxyService;
exports.ProxyService = ProxyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_service_1.ConfigService])
], ProxyService);
//# sourceMappingURL=proxy.service.js.map