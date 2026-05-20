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
exports.StaffPageListDto = exports.StaffUpdateDto = exports.StaffCreateDto = void 0;
const class_validator_1 = require("class-validator");
const base_dto_1 = require("../../../common/base.dto");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class StaffCreateDto {
}
exports.StaffCreateDto = StaffCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '员工姓名', example: "张三" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "staffName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '员工编号', example: "S001" }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "staffCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所属部门ID', example: "uuid-dept-id" }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "deptId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '所属岗位ID', example: "uuid-post-id" }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "postId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '性别 (0:未知, 1:男, 2:女)', example: "1" }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '手机号码', example: "13800138000" }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '电子邮箱', example: "zhangsan@example.com" }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '身份证号码', example: "110101199001011234" }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "idCard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '显示排序', example: 1 }),
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StaffCreateDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '员工状态 (true:在职, false:离职)', example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], StaffCreateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '备注信息', example: "核心研发人员", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StaffCreateDto.prototype, "remark", void 0);
class StaffUpdateDto extends StaffCreateDto {
}
exports.StaffUpdateDto = StaffUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '员工ID', example: "uuid-staff-id" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], StaffUpdateDto.prototype, "id", void 0);
class StaffPageListDto extends base_dto_1.BasePageDto {
}
exports.StaffPageListDto = StaffPageListDto;
//# sourceMappingURL=create-staff.dto.js.map