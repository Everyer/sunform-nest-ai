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
exports.RolePageListDto = exports.RoleUpdateDto = exports.RoleCreateDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
class RoleCreateDto {
}
exports.RoleCreateDto = RoleCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色名称', example: "普通管理员" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RoleCreateDto.prototype, "roleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色权限字符 (JSON)', example: ["common"], required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RoleCreateDto.prototype, "roleKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '绑定的菜单ID列表', type: [String], example: ["menu-id-1"] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RoleCreateDto.prototype, "menuIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '数据权限关联的部门ID列表', type: [String], example: [], required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], RoleCreateDto.prototype, "departmentIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '数据权限类型 (0:本人, 1:本部门及以下, 2:本部门, 3:自定义, 4:全部)', example: '4', enum: ['0', '1', '2', '3', '4'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['0', '1', '2', '3', '4']),
    __metadata("design:type", String)
], RoleCreateDto.prototype, "dataScope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色状态 (true:启用, false:禁用)', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RoleCreateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注信息', example: "具有部分管理权限的角色", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RoleCreateDto.prototype, "remark", void 0);
class RoleUpdateDto extends RoleCreateDto {
}
exports.RoleUpdateDto = RoleUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '角色ID', example: "uuid-role-id" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RoleUpdateDto.prototype, "id", void 0);
class RolePageListDto extends base_dto_1.BasePageDto {
}
exports.RolePageListDto = RolePageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索角色名称', example: "管理员", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RolePageListDto.prototype, "roleName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态过滤', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RolePageListDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '数据权限过滤', example: "4", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RolePageListDto.prototype, "dataScope", void 0);
//# sourceMappingURL=create-role.dto.js.map