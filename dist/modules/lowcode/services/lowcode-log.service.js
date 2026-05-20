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
exports.LowcodeLogService = void 0;
const common_1 = require("@nestjs/common");
const lowcode_log_entity_1 = require("../entities/lowcode-log.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../../common/exceptions/business.exception");
const sequelize_2 = require("sequelize");
let LowcodeLogService = class LowcodeLogService {
    constructor(model) {
        this.model = model;
    }
    async create(createDto) {
        return this.model.create(createDto);
    }
    async findPageList(dto) {
        const { pageindex, pagesize, componentCode, componentName } = dto;
        const where = {};
        if (componentCode) {
            where.componentCode = { [sequelize_2.Op.like]: `%${componentCode}%` };
        }
        if (componentName) {
            where.componentName = { [sequelize_2.Op.like]: `%${componentName}%` };
        }
        const { rows, count } = await this.model.findAndCountAll({
            where,
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [
                ['createdAt', 'DESC']
            ]
        });
        return {
            list: rows,
            total: count
        };
    }
    async findPageListByCode(componentCode, pageindex = 1, pagesize = 10) {
        if (!componentCode) {
            throw new business_exception_1.BusinessException('componentCode不能为空');
        }
        const { rows, count } = await this.model.findAndCountAll({
            where: {
                componentCode: componentCode
            },
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [
                ['createdAt', 'DESC']
            ],
            attributes: {
                exclude: ['componentConfig']
            },
        });
        return {
            list: rows,
            total: count
        };
    }
    findAll() {
        return this.model.findAll({
            order: [['createdAt', 'DESC']]
        });
    }
    findByCode(componentCode) {
        if (!componentCode) {
            throw new business_exception_1.BusinessException('componentCode不能为空');
        }
        return this.model.findAll({
            where: {
                componentCode: componentCode
            },
            order: [['createdAt', 'DESC']]
        });
    }
    findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        return this.model.findByPk(id);
    }
    async updateRemark(dto) {
        const { id, remark } = dto;
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        const log = await this.model.findByPk(id);
        if (!log) {
            throw new business_exception_1.BusinessException('日志不存在');
        }
        await this.model.update({ remark }, { where: { id } });
        return true;
    }
    async remove(id, user) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        const isAdmin = user.roles?.find((item) => item.id === 'd02b790d-b9b7-4ac1-b005-fba115bdac03');
        if (!isAdmin) {
            throw new business_exception_1.BusinessException('只有管理员才能删除日志');
        }
        let count = await this.model.destroy({
            where: {
                id
            }
        });
        if (count > 0) {
            return true;
        }
        else {
            throw new business_exception_1.BusinessException('删除失败');
        }
    }
};
exports.LowcodeLogService = LowcodeLogService;
exports.LowcodeLogService = LowcodeLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(lowcode_log_entity_1.LowcodeLog)),
    __metadata("design:paramtypes", [Object])
], LowcodeLogService);
//# sourceMappingURL=lowcode-log.service.js.map