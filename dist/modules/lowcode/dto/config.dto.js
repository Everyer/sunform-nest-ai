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
exports.ConfigUpdateDto = exports.ConfigCreateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ConfigCreateDto {
}
exports.ConfigCreateDto = ConfigCreateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '基础地址', example: "/api", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfigCreateDto.prototype, "baseUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Token键名', example: "Authorization", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfigCreateDto.prototype, "tokenKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Token值', example: "Bearer token...", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfigCreateDto.prototype, "tokenValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '主机地址', example: "http://localhost:3000", required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfigCreateDto.prototype, "host", void 0);
class ConfigUpdateDto extends ConfigCreateDto {
}
exports.ConfigUpdateDto = ConfigUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID', example: "" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfigUpdateDto.prototype, "id", void 0);
//# sourceMappingURL=config.dto.js.map