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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const task_service_1 = require("./task.service");
const task_dto_1 = require("./dto/task.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TaskController = class TaskController {
    constructor(service) {
        this.service = service;
    }
    async todo(dto, req) {
        return await this.service.findTodo(dto, req.user?.username || 'admin');
    }
    async done(dto, req) {
        return await this.service.findDone(dto, req.user?.username || 'admin');
    }
    async detail(dto) {
        return await this.service.detail(dto.instanceId, dto.nodeId);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '我的待办' }),
    (0, common_1.Post)('todo'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_dto_1.TaskPageListDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "todo", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '我的已办' }),
    (0, common_1.Post)('done'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_dto_1.TaskPageListDto, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "done", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: '待办/已办详情' }),
    (0, common_1.Post)('detail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [task_dto_1.TaskDetailDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "detail", null);
exports.TaskController = TaskController = __decorate([
    (0, swagger_1.ApiTags)('流程任务'),
    (0, common_1.Controller)('workflow/task'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map