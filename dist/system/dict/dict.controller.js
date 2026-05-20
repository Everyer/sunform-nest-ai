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
exports.DictController = void 0;
const common_1 = require("@nestjs/common");
const dict_service_1 = require("./dict.service");
const create_dict_dto_1 = require("./dto/create-dict.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DictController = class DictController {
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
    async detail(dto) {
        return await this.service.findOne(dto.id);
    }
    async delete(dto) {
        return await this.service.remove(dto.id);
    }
    async findAll() {
        return await this.service.findAll();
    }
    async findTree() {
        return await this.service.findTree();
    }
    async findListByCode(dto) {
        return await this.service.findListByCode(dto.code);
    }
};
exports.DictController = DictController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '创建字典项' }),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dict_dto_1.DictCreateDto]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '更新字典项' }),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dict_dto_1.DictUpdateDto]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '分页获取字典列表' }),
    (0, common_1.Post)('page'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dict_dto_1.DictPageListDto]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取字典详情' }),
    (0, common_1.Post)('detail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "detail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '删除字典项' }),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取所有字典项列表' }),
    (0, common_1.Post)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DictController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取字典树结构' }),
    (0, common_1.Post)('findTree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DictController.prototype, "findTree", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '根据编码获取字典列表' }),
    (0, common_1.Post)('findListByCode'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DictController.prototype, "findListByCode", null);
exports.DictController = DictController = __decorate([
    (0, swagger_1.ApiTags)('字典管理'),
    (0, common_1.Controller)('dict'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dict_service_1.DictService])
], DictController);
//# sourceMappingURL=dict.controller.js.map