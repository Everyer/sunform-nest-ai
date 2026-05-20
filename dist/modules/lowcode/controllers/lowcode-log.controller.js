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
exports.LowcodeLogController = void 0;
const common_1 = require("@nestjs/common");
const lowcode_log_service_1 = require("../services/lowcode-log.service");
const lowcode_log_dto_1 = require("../dto/lowcode-log.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../system/auth/jwt-auth.guard");
let LowcodeLogController = class LowcodeLogController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return await this.service.create(dto);
    }
    async list(dto) {
        return await this.service.findPageList(dto);
    }
    async detail(dto) {
        return await this.service.findOne(dto.id);
    }
    async delete(dto, request) {
        return await this.service.remove(dto.id, request.user);
    }
    async findAll() {
        return await this.service.findAll();
    }
    async findByCode(dto) {
        return await this.service.findByCode(dto.componentCode);
    }
    async findPageByCode(dto) {
        return await this.service.findPageListByCode(dto.componentCode, dto.pageindex, dto.pagesize);
    }
    async updateRemark(dto) {
        return await this.service.updateRemark(dto);
    }
};
exports.LowcodeLogController = LowcodeLogController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: '创建低代码日志' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lowcode_log_dto_1.LowcodeLogCreateDto]),
    __metadata("design:returntype", Promise)
], LowcodeLogController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('page'),
    (0, swagger_1.ApiOperation)({ summary: '分页查询低代码日志列表' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lowcode_log_dto_1.LowcodeLogPageListDto]),
    __metadata("design:returntype", Promise)
], LowcodeLogController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('detail'),
    (0, swagger_1.ApiOperation)({ summary: '获取低代码日志详情' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LowcodeLogController.prototype, "detail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('delete'),
    (0, swagger_1.ApiOperation)({ summary: '删除低代码日志(仅管理员)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LowcodeLogController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('list'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有低代码日志列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LowcodeLogController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('listByCode'),
    (0, swagger_1.ApiOperation)({ summary: '根据低代码code获取所有日志' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lowcode_log_dto_1.LowcodeLogByCodeDto]),
    __metadata("design:returntype", Promise)
], LowcodeLogController.prototype, "findByCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('pageByCode'),
    (0, swagger_1.ApiOperation)({ summary: '根据低代码code分页查询日志' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lowcode_log_dto_1.LowcodeLogPageByCodeDto]),
    __metadata("design:returntype", Promise)
], LowcodeLogController.prototype, "findPageByCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('updateRemark'),
    (0, swagger_1.ApiOperation)({ summary: '更新日志备注' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [lowcode_log_dto_1.LowcodeLogUpdateRemarkDto]),
    __metadata("design:returntype", Promise)
], LowcodeLogController.prototype, "updateRemark", null);
exports.LowcodeLogController = LowcodeLogController = __decorate([
    (0, swagger_1.ApiTags)('低代码日志管理'),
    (0, common_1.Controller)('lowcodeLog'),
    __metadata("design:paramtypes", [lowcode_log_service_1.LowcodeLogService])
], LowcodeLogController);
//# sourceMappingURL=lowcode-log.controller.js.map