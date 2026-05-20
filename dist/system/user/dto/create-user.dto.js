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
exports.UserPageListDto = exports.UserUpdateDto = exports.UserCreateDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class UserCreateDto {
}
exports.UserCreateDto = UserCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '登录用户名', example: "admin" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '登录密码', example: "123456" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '关联员工ID', example: "uuid-staff-id" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '分配的角色ID列表', type: [String], example: ["role-id-1"] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UserCreateDto.prototype, "roleIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '数据权限范围', example: "1", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "dataScope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '排序号', example: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserCreateDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '账号状态 (true:启用, false:禁用)', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserCreateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注信息', example: "超级管理员账号", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserCreateDto.prototype, "remark", void 0);
class UserUpdateDto extends UserCreateDto {
}
exports.UserUpdateDto = UserUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '用户ID', example: "uuid-user-id" }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "id", void 0);
class UserPageListDto extends base_dto_1.BasePageDto {
}
exports.UserPageListDto = UserPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索用户名', example: "admin", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserPageListDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '过滤部门ID', example: "uuid-dept-id", required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UserPageListDto.prototype, "deptId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态过滤', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserPageListDto.prototype, "status", void 0);
//# sourceMappingURL=create-user.dto.js.map