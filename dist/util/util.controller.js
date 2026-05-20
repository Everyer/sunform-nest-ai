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
exports.UtilController = void 0;
const util_service_1 = require("./util.service");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../system/auth/jwt-auth.guard");
let UtilController = class UtilController {
    constructor(utilService) {
        this.utilService = utilService;
    }
    async getLowcodeCode(dto) {
        return await this.utilService.getLowcodeCode(dto.componentCode);
    }
    async getExampleLowcodeCode(dto) {
        return await this.utilService.getExampleLowcodeCode(dto.componentCode);
    }
};
exports.UtilController = UtilController;
__decorate([
    (0, common_1.Post)('getLowcodeCode'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UtilController.prototype, "getLowcodeCode", null);
__decorate([
    (0, common_1.Post)('getExampleLowcodeCode'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UtilController.prototype, "getExampleLowcodeCode", null);
exports.UtilController = UtilController = __decorate([
    (0, swagger_1.ApiTags)('工具类'),
    (0, common_1.Controller)('util'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [util_service_1.UtilService])
], UtilController);
//# sourceMappingURL=util.controller.js.map