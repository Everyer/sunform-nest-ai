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
exports.TemplateController = void 0;
const common_1 = require("@nestjs/common");
const template_service_1 = require("./template.service");
const template_dto_1 = require("./dto/template.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TemplateController = class TemplateController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return await this.service.create(dto);
    }
    async update(dto) {
        return await this.service.update(dto);
    }
    async list(dto) {
        return await this.service.findPageList(dto);
    }
    async findAll() {
        return await this.service.findAll();
    }
    async detail(dto) {
        return await this.service.findOne(dto.id);
    }
    async delete(dto) {
        return await this.service.remove(dto.id);
    }
    async publish(dto) {
        return await this.service.publish(dto.id);
    }
    async deactivate(dto) {
        return await this.service.deactivate(dto.id);
    }
};
exports.TemplateController = TemplateController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '创建模板' }),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.CreateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '更新模板' }),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.UpdateTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '分页获取模板列表' }),
    (0, common_1.Post)('page'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.TemplatePageListDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取所有已发布模板' }),
    (0, common_1.Post)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取模板详情' }),
    (0, common_1.Post)('detail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "detail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '删除模板' }),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '发布模板' }),
    (0, common_1.Post)('publish'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [template_dto_1.PublishTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "publish", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '停用模板' }),
    (0, common_1.Post)('deactivate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplateController.prototype, "deactivate", null);
exports.TemplateController = TemplateController = __decorate([
    (0, swagger_1.ApiTags)('流程模板'),
    (0, common_1.Controller)('workflow/template'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [template_service_1.TemplateService])
], TemplateController);
//# sourceMappingURL=template.controller.js.map