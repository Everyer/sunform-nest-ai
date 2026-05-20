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
exports.ConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_entity_1 = require("../entities/config.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../../common/exceptions/business.exception");
let ConfigService = class ConfigService {
    constructor(model) {
        this.model = model;
    }
    async createOrUpdate(createDto, userid) {
        const existingConfig = await this.model.findOne({
            where: { userid }
        });
        if (existingConfig) {
            await this.model.update({ ...createDto }, { where: { userid } });
            return this.model.findOne({ where: { userid } });
        }
        else {
            return this.model.create({
                ...createDto,
                userid
            });
        }
    }
    async findByUserId(userid) {
        return this.model.findOne({
            where: { userid },
            raw: true
        });
    }
    async findAll() {
        return this.model.findAll({
            order: [['createdAt', 'DESC']]
        });
    }
    async findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        return this.model.findByPk(id);
    }
    async update(dto, userid) {
        const { id } = dto;
        if (id) {
            return this.model.update(dto, {
                where: { id }
            });
        }
        else {
            return this.model.update(dto, {
                where: { userid }
            });
        }
    }
    async remove(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        const count = await this.model.destroy({
            where: { id }
        });
        if (count > 0) {
            return true;
        }
        else {
            throw new business_exception_1.BusinessException('删除失败');
        }
    }
    async removeByUserId(userid) {
        if (!userid) {
            throw new business_exception_1.BusinessException('用户ID不能为空');
        }
        const count = await this.model.destroy({
            where: { userid }
        });
        if (count > 0) {
            return true;
        }
        else {
            throw new business_exception_1.BusinessException('删除失败');
        }
    }
};
exports.ConfigService = ConfigService;
exports.ConfigService = ConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(config_entity_1.LowcodeConfig)),
    __metadata("design:paramtypes", [Object])
], ConfigService);
//# sourceMappingURL=config.service.js.map