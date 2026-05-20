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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const role_entity_1 = require("./entities/role.entity");
const sequelize_1 = require("@nestjs/sequelize");
const business_exception_1 = require("../../common/exceptions/business.exception");
const menu_entity_1 = require("../menu/entities/menu.entity");
const department_entity_1 = require("../department/entities/department.entity");
let RoleService = class RoleService {
    constructor(model) {
        this.model = model;
    }
    async create(CreateDto) {
        const { menuIds, departmentIds } = CreateDto;
        const role = await this.model.create(CreateDto);
        if (menuIds?.length) {
            await role.$set('menus', menuIds);
        }
        if (departmentIds?.length) {
            await role.$set('departments', departmentIds);
        }
        return role;
    }
    async findPageList(dto) {
        const { pageindex, pagesize } = dto;
        console.log(dto);
        const { rows, count } = await this.model.findAndCountAll({
            offset: (pageindex - 1) * pagesize,
            limit: pagesize,
            order: [['sort', 'ASC']]
        });
        return {
            list: rows,
            total: count
        };
    }
    findAll() {
        return this.model.findAll({
            include: ['menus', 'departments']
        });
    }
    async findOne(id) {
        if (!id) {
            throw new business_exception_1.BusinessException('id不能为空');
        }
        let res = await this.model.findByPk(id, {
            include: [
                {
                    model: menu_entity_1.Menu,
                    attributes: ['id'],
                    through: { attributes: [] }
                },
                {
                    model: department_entity_1.Department,
                    attributes: ['id'],
                    through: { attributes: [] }
                }
            ]
        });
        if (res) {
            let obj = res.toJSON();
            obj.menuIds = obj.menus.map(e => e.id);
            obj.departmentIds = obj.departments.map(e => e.id);
            delete obj.menus;
            delete obj.departments;
            return obj;
        }
        else {
            throw new business_exception_1.BusinessException('角色不存在');
        }
    }
    async update(dto) {
        const { id, menuIds, departmentIds } = dto;
        const [affectedCount] = await this.model.update(dto, {
            where: { id }
        });
        if (affectedCount === 0) {
            throw new Error('角色未找到或未更新');
        }
        const role = await this.model.findByPk(id);
        if (!role) {
            throw new Error('角色未找到');
        }
        if (menuIds?.length) {
            await role.$set('menus', menuIds);
        }
        if (departmentIds?.length) {
            await role.$set('departments', departmentIds);
        }
        return role;
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
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(role_entity_1.Role)),
    __metadata("design:paramtypes", [Object])
], RoleService);
//# sourceMappingURL=role.service.js.map