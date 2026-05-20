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
exports.TaskDetailDto = exports.TaskPageListDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
class TaskPageListDto extends base_dto_1.BasePageDto {
}
exports.TaskPageListDto = TaskPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索标题', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TaskPageListDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '模板ID过滤', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TaskPageListDto.prototype, "templateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '优先级过滤', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TaskPageListDto.prototype, "priority", void 0);
class TaskDetailDto {
}
exports.TaskDetailDto = TaskDetailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '实例ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaskDetailDto.prototype, "instanceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '节点ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TaskDetailDto.prototype, "nodeId", void 0);
//# sourceMappingURL=task.dto.js.map