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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const staff_entity_1 = require("./entities/staff.entity");
const user_entity_1 = require("../user/entities/user.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../common/exceptions/business.exception");
let StaffService = class StaffService {
    constructor(model) {
        this.model = model;
    }
    async create(dto) {
        let hasCode = await this.model.findOne({
            where: {
                staffCode: dto.staffCode
            }
        });
        if (hasCode) {
            throw new business_exception_1.BusinessException('员工编码已存在');
        }
        return this.model.create(dto);
    }
    async findPageList(dto) {
        const { pageindex, pagesize } = dto;
        const where = {};
        const { rows, count } = await this.model.findAndCountAll({
            where,
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['sort', 'ASC']],
            include: ['department', 'post']
        });
        return {
            list: rows,
            total: count
        };
    }
    findAll() {
        return this.model.findAll();
    }
    async findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        return await this.model.findByPk(id);
    }
    update(dto) {
        const { id } = dto;
        return this.model.update(dto, {
            where: {
                id
            }
        });
    }
    async remove(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        const userCount = await user_entity_1.User.count({
            where: {
                staffId: id
            }
        });
        if (userCount > 0) {
            throw new business_exception_1.BusinessException('该员工下有用户，无法删除');
        }
        return this.model.destroy({
            where: {
                id
            }
        });
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(staff_entity_1.Staff)),
    __metadata("design:paramtypes", [Object])
], StaffService);
//# sourceMappingURL=staff.service.js.map