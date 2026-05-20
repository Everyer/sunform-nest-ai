"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataScopeModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const role_entity_1 = require("../role/entities/role.entity");
const department_entity_1 = require("../department/entities/department.entity");
const user_entity_1 = require("../user/entities/user.entity");
const data_scope_service_1 = require("./data-scope.service");
let DataScopeModule = class DataScopeModule {
};
exports.DataScopeModule = DataScopeModule;
exports.DataScopeModule = DataScopeModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([role_entity_1.Role, department_entity_1.Department, user_entity_1.User])],
        providers: [data_scope_service_1.DataScopeService],
        exports: [data_scope_service_1.DataScopeService],
    })
], DataScopeModule);
//# sourceMappingURL=data-scope.module.js.map