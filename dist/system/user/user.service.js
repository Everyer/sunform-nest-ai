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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("./entities/user.entity");
const sequelize_1 = require("@nestjs/sequelize");
const staff_service_1 = require("../staff/staff.service");
const business_exception_1 = require("../../common/exceptions/business.exception");
const role_entity_1 = require("../role/entities/role.entity");
const staff_entity_1 = require("../staff/entities/staff.entity");
let UserService = class UserService {
    constructor(model, staffService) {
        this.model = model;
        this.staffService = staffService;
    }
    async create(CreateDto) {
        const { roleIds, staffId } = CreateDto;
        const resStaff = await this.staffService.findOne(staffId);
        if (resStaff && resStaff.deptId) {
            const deptId = resStaff.deptId;
            const user = await this.model.create({
                ...CreateDto,
                deptId
            });
            if (roleIds?.length) {
                await user.$set('roles', roleIds);
            }
            return user;
        }
        else {
            throw new business_exception_1.BusinessException('未找到该员工所对应的部门');
        }
    }
    async findPageList(dto) {
        const { pageindex, pagesize } = dto;
        const where = {};
        const { rows, count } = await this.model.findAndCountAll({
            where,
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['sort', 'ASC']],
            include: ['roles', 'department', {
                    model: staff_entity_1.Staff,
                    attributes: ['staffName']
                }]
        });
        return {
            list: rows,
            total: count
        };
    }
    findAll() {
        return this.model.findAll({
            include: ['roles', 'department', {
                    model: staff_entity_1.Staff,
                    attributes: ['staffName']
                }]
        });
    }
    async findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        let role = await this.model.findByPk(id, {
            include: {
                model: role_entity_1.Role,
                attributes: ['id'],
                through: { attributes: [] }
            }
        });
        if (role) {
            let obj = role.toJSON();
            obj.roleIds = obj.roles.map((item) => item.id);
            delete obj.roles;
            return obj;
        }
        else {
            throw new business_exception_1.BusinessException('未找到该用户');
        }
    }
    findOneByUserPass(username, password) {
        return this.model.findOne({
            where: {
                username,
                password
            },
            include: ['roles', 'department', {
                    model: staff_entity_1.Staff,
                    attributes: ['staffName']
                }]
        });
    }
    async update(dto) {
        const { id, roleIds } = dto;
        console.log(dto);
        const res = await this.model.update(dto, {
            where: {
                id
            }
        });
        if (roleIds) {
            const user = await this.model.findByPk(id);
            if (user) {
                await user.$set('roles', roleIds);
            }
        }
        return res;
    }
    async remove(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
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
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(user_entity_1.User)),
    __metadata("design:paramtypes", [Object, staff_service_1.StaffService])
], UserService);
//# sourceMappingURL=user.service.js.map