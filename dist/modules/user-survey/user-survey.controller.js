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
exports.UserSurveyController = void 0;
const common_1 = require("@nestjs/common");
const user_survey_service_1 = require("./user-survey.service");
const create_user_survey_dto_1 = require("./dto/create-user-survey.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../system/auth/jwt-auth.guard");
const data_scope_service_1 = require("../../system/auth/data-scope.service");
let UserSurveyController = class UserSurveyController {
    constructor(service, dataScope) {
        this.service = service;
        this.dataScope = dataScope;
    }
    async create(dto, req) {
        return await this.service.create({ ...dto, createBy: req.user.id });
    }
    async update(dto) {
        return await this.service.update(dto);
    }
    async list(dto, req) {
        const createByWhere = await this.dataScope.buildCreateByWhere(req.user);
        return await this.service.findPageList(dto, createByWhere);
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
};
exports.UserSurveyController = UserSurveyController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '创建台账' }),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_survey_dto_1.UserSurveyCreateDto, Object]),
    __metadata("design:returntype", Promise)
], UserSurveyController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '更新台账信息' }),
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_survey_dto_1.UserSurveyUpdateDto]),
    __metadata("design:returntype", Promise)
], UserSurveyController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '分页获取台账列表' }),
    (0, common_1.Post)('page'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_survey_dto_1.UserSurveyPageListDto, Object]),
    __metadata("design:returntype", Promise)
], UserSurveyController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取台账详情' }),
    (0, common_1.Post)('detail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserSurveyController.prototype, "detail", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '删除台账记录' }),
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserSurveyController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取所有台账列表' }),
    (0, common_1.Post)('list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserSurveyController.prototype, "findAll", null);
exports.UserSurveyController = UserSurveyController = __decorate([
    (0, swagger_1.ApiTags)('用户台账信息管理'),
    (0, common_1.Controller)('userSurvey'),
    __metadata("design:paramtypes", [user_survey_service_1.UserSurveyService,
        data_scope_service_1.DataScopeService])
], UserSurveyController);
//# sourceMappingURL=user-survey.controller.js.map