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
exports.ComponentController = void 0;
const common_1 = require("@nestjs/common");
const component_service_1 = require("../services/component.service");
const component_dto_1 = require("../dto/component.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../system/auth/jwt-auth.guard");
const component_constants_1 = require("../constants/component.constants");
let ComponentController = class ComponentController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return await this.service.create(dto);
    }
    async update(dto, request) {
        return await this.service.update(dto, request.user);
    }
    async list(dto) {
        return await this.service.findPageList(dto);
    }
    async detail(dto) {
        return await this.service.findOne(dto.id);
    }
    async detailById(dto) {
        return await this.service.findComponentById(dto.id);
    }
    async detailByComponentCode(dto) {
        return await this.service.findComponentByComponentCode(dto.componentCode);
    }
    async delete(dto, request) {
        return await this.service.remove(dto.id, request.user);
    }
    async findAll() {
        return await this.service.findAll();
    }
    async findByPageId(dto) {
        return await this.service.findByPageId(dto.pageId);
    }
    async findByProjectId(dto) {
        return await this.service.findByProjectId(dto.projectId);
    }
    async getComponentTypeOptions() {
        return {
            code: 0,
            message: '获取成功',
            success: true,
            data: component_constants_1.COMPONENT_TYPE_OPTIONS
        };
    }
    async getConfigByOtherProject(dto) {
        const result = await this.service.getConfigByOtherProject(dto);
        return result;
    }
    async updateOperators(dto, request) {
        await this.service.updateOperators(dto.id, dto.operatorIds, request.user);
        return {
            code: 0,
            message: '更新成功',
            success: true
        };
    }
};
exports.ComponentController = ComponentController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: '创建组件' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [component_dto_1.ComponentCreateDto]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('update'),
    (0, swagger_1.ApiOperation)({ summary: '更新组件' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [component_dto_1.ComponentUpdateDto, Object]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('page'),
    (0, swagger_1.ApiOperation)({ summary: '分页查询组件列表' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [component_dto_1.ComponentPageListDto]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('detail'),
    (0, swagger_1.ApiOperation)({ summary: '获取组件详情' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "detail", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('detailById'),
    (0, swagger_1.ApiOperation)({ summary: '根据id获取组件详情' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "detailById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('detailByComponentCode'),
    (0, swagger_1.ApiOperation)({ summary: '根据组件编码获取组件详情' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "detailByComponentCode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('delete'),
    (0, swagger_1.ApiOperation)({ summary: '删除组件(仅管理员)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('list'),
    (0, swagger_1.ApiOperation)({ summary: '获取所有组件列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('listByPage'),
    (0, swagger_1.ApiOperation)({ summary: '根据页面ID获取组件列表' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "findByPageId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('listByProject'),
    (0, swagger_1.ApiOperation)({ summary: '根据项目ID获取组件列表' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "findByProjectId", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('typeOptions'),
    (0, swagger_1.ApiOperation)({ summary: '获取组件类型选项' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "getComponentTypeOptions", null);
__decorate([
    (0, common_1.Post)('getConfigByOtherProject'),
    (0, swagger_1.ApiOperation)({
        summary: '根据项目ID获取组件配置（跳过token验证）',
        description: '提供给其他系统调用的接口，无需token验证。通过项目ID和组件ID或组件代码获取组件配置信息。'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '获取成功',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'number', example: 0 },
                message: { type: 'string', example: '获取成功' },
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: '组件ID' },
                        componentCode: { type: 'string', description: '组件代码' },
                        componentName: { type: 'string', description: '组件名称' },
                        componentConfig: { type: 'object', description: '组件配置' }
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [component_dto_1.GetConfigByOtherProjectDto]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "getConfigByOtherProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('updateOperators'),
    (0, swagger_1.ApiOperation)({ summary: '更新组件可操作人' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '更新成功',
        schema: {
            type: 'object',
            properties: {
                code: { type: 'number', example: 0 },
                message: { type: 'string', example: '更新成功' },
                success: { type: 'boolean', example: true }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [component_dto_1.UpdateOperatorsDto, Object]),
    __metadata("design:returntype", Promise)
], ComponentController.prototype, "updateOperators", null);
exports.ComponentController = ComponentController = __decorate([
    (0, swagger_1.ApiTags)('组件管理'),
    (0, common_1.Controller)('component'),
    __metadata("design:paramtypes", [component_service_1.ComponentService])
], ComponentController);
//# sourceMappingURL=component.controller.js.map