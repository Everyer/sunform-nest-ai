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
exports.MenuPageListDto = exports.MenuUpdateDto = exports.MenuCreateDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class MenuCreateDto {
}
exports.MenuCreateDto = MenuCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '父级菜单ID', example: "0", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "pid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单/目录名称', example: "系统管理" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '唯一标识编码', example: "SystemModule" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '是否在导航栏显示', example: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Boolean)
], MenuCreateDto.prototype, "isNav", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '类型 (menu:菜单, comp:组件/页面)', example: 'menu', enum: ['menu', 'comp'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['menu', 'comp']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '图标类名', example: "i-lucide-settings", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '路由路径', example: "/system" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "path", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '前端组件相对路径', example: "layout/index", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "component", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '低代码页面编码', example: "page_123", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "lowCodeCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单状态 (true:显示, false:隐藏)', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MenuCreateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示排序', example: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MenuCreateDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注信息', example: "系统核心管理模块", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuCreateDto.prototype, "remark", void 0);
class MenuUpdateDto extends MenuCreateDto {
}
exports.MenuUpdateDto = MenuUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单ID', example: "uuid-menu-id" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MenuUpdateDto.prototype, "id", void 0);
class MenuPageListDto extends base_dto_1.BasePageDto {
}
exports.MenuPageListDto = MenuPageListDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索菜单名称', example: "管理", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuPageListDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '搜索编码', example: "System", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuPageListDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '类型过滤', example: "menu", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MenuPageListDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '状态过滤', example: true, required: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], MenuPageListDto.prototype, "status", void 0);
//# sourceMappingURL=create-menu.dto.js.map