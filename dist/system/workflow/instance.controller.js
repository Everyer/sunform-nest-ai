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
exports.InstanceController = void 0;
const common_1 = require("@nestjs/common");
const instance_service_1 = require("./instance.service");
const instance_dto_1 = require("./dto/instance.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let InstanceController = class InstanceController {
    constructor(service) {
        this.service = service;
    }
    async start(dto, req) {
        return await this.service.start(dto, req.user?.username || 'admin');
    }
    async approve(dto, req) {
        return await this.service.approve(dto, req.user?.username || 'admin');
    }
    async withdraw(dto, req) {
        return await this.service.withdraw(dto.instanceId, req.user?.username || 'admin');
    }
    async list(dto, req) {
        return await this.service.findPageList(dto, req.user?.username || 'admin');
    }
    async detail(dto) {
        return await this.service.findOne(dto.id);
    }
};
exports.InstanceController = InstanceController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '发起流程' }),
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instance_dto_1.StartInstanceDto, Object]),
    __metadata("design:returntype", Promise)
], InstanceController.prototype, "start", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '审批操作' }),
    (0, common_1.Post)('approve'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instance_dto_1.ApproveInstanceDto, Object]),
    __metadata("design:returntype", Promise)
], InstanceController.prototype, "approve", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '撤回流程' }),
    (0, common_1.Post)('withdraw'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instance_dto_1.WithdrawInstanceDto, Object]),
    __metadata("design:returntype", Promise)
], InstanceController.prototype, "withdraw", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '我发起的流程列表' }),
    (0, common_1.Post)('page'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [instance_dto_1.InstancePageListDto, Object]),
    __metadata("design:returntype", Promise)
], InstanceController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '流程实例详情' }),
    (0, common_1.Post)('detail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InstanceController.prototype, "detail", null);
exports.InstanceController = InstanceController = __decorate([
    (0, swagger_1.ApiTags)('流程实例'),
    (0, common_1.Controller)('workflow/instance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [instance_service_1.InstanceService])
], InstanceController);
//# sourceMappingURL=instance.controller.js.map