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
exports.InstancePageListDto = exports.WithdrawInstanceDto = exports.ApproveInstanceDto = exports.StartInstanceDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
class StartInstanceDto {
}
exports.StartInstanceDto = StartInstanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '流程模板ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StartInstanceDto.prototype, "templateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '实例标题' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartInstanceDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '表单数据' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], StartInstanceDto.prototype, "formData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否仅保存草稿（不进入审批流）', required: false, default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], StartInstanceDto.prototype, "draft", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '优先级：0=普通 1=紧急 2=特急', required: false, default: 0 }),
    (0, class_validator_1.IsIn)([0, 1, 2]),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StartInstanceDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '截止日期', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartInstanceDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '附件列表', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], StartInstanceDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '编辑草稿时传入已有实例ID', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StartInstanceDto.prototype, "instanceId", void 0);
class ApproveInstanceDto {
}
exports.ApproveInstanceDto = ApproveInstanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '流程实例ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveInstanceDto.prototype, "instanceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '节点ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveInstanceDto.prototype, "nodeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '操作：agree/reject/transfer/addSign' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['agree', 'reject', 'transfer', 'addSign']),
    __metadata("design:type", String)
], ApproveInstanceDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '审批意见', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveInstanceDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '表单数据变更', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ApproveInstanceDto.prototype, "formData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '转交目标人（转交时必填）', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveInstanceDto.prototype, "transferTo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '加签人（加签时必填）', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveInstanceDto.prototype, "addSignTo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '附件列表', required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ApproveInstanceDto.prototype, "attachments", void 0);
class WithdrawInstanceDto {
}
exports.WithdrawInstanceDto = WithdrawInstanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '流程实例ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], WithdrawInstanceDto.prototype, "instanceId", void 0);
class InstancePageListDto extends base_dto_1.BasePageDto {
}
exports.InstancePageListDto = InstancePageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索标题', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InstancePageListDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态过滤', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InstancePageListDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '模板ID过滤', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InstancePageListDto.prototype, "templateId", void 0);
//# sourceMappingURL=instance.dto.js.map