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
exports.DataScopeService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const role_entity_1 = require("../role/entities/role.entity");
const department_entity_1 = require("../department/entities/department.entity");
const user_entity_1 = require("../user/entities/user.entity");
const sequelize_2 = require("sequelize");
let DataScopeService = class DataScopeService {
    constructor(roleModel, deptModel, userModel) {
        this.roleModel = roleModel;
        this.deptModel = deptModel;
        this.userModel = userModel;
    }
    async getDeptIds(user) {
        if (!user?.roles?.length)
            return [];
        const roleIds = user.roles.map(r => r.id);
        const roles = await this.roleModel.findAll({
            where: { id: roleIds },
            include: ['departments'],
        });
        if (roles.some(r => r.dataScope === '4'))
            return [];
        const deptSet = new Set();
        for (const role of roles) {
            switch (role.dataScope) {
                case '1':
                    if (user.deptId) {
                        deptSet.add(user.deptId);
                        const subIds = await this.getSubDeptIds(user.deptId);
                        subIds.forEach(id => deptSet.add(id));
                    }
                    break;
                case '2':
                    if (user.deptId)
                        deptSet.add(user.deptId);
                    break;
                case '3':
                    if (role.departments?.length) {
                        role.departments.forEach(d => deptSet.add(d.id));
                    }
                    break;
            }
        }
        return [...deptSet];
    }
    async getSubDeptIds(parentId) {
        const ids = [];
        const children = await this.deptModel.findAll({
            where: { pid: parentId },
            attributes: ['id'],
        });
        for (const child of children) {
            ids.push(child.id);
            const subIds = await this.getSubDeptIds(child.id);
            ids.push(...subIds);
        }
        return ids;
    }
    async buildDeptWhere(user) {
        const deptIds = await this.getDeptIds(user);
        if (!deptIds.length)
            return undefined;
        return { deptId: { [sequelize_2.Op.in]: deptIds } };
    }
    async buildCreateByWhere(user) {
        const deptIds = await this.getDeptIds(user);
        if (!deptIds.length)
            return undefined;
        const users = await this.userModel.findAll({
            where: { deptId: { [sequelize_2.Op.in]: deptIds } },
            attributes: ['id'],
        });
        const userIds = users.map(u => u.id);
        if (!userIds.length)
            return { createBy: null };
        return { createBy: { [sequelize_2.Op.in]: userIds } };
    }
};
exports.DataScopeService = DataScopeService;
exports.DataScopeService = DataScopeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(role_entity_1.Role)),
    __param(1, (0, sequelize_1.InjectModel)(department_entity_1.Department)),
    __param(2, (0, sequelize_1.InjectModel)(user_entity_1.User)),
    __metadata("design:paramtypes", [Object, Object, Object])
], DataScopeService);
//# sourceMappingURL=data-scope.service.js.map