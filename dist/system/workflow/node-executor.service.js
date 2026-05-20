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
exports.NodeExecutorService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const flow_instance_entity_1 = require("./entities/flow-instance.entity");
const staff_entity_1 = require("../staff/entities/staff.entity");
const user_entity_1 = require("../user/entities/user.entity");
let NodeExecutorService = class NodeExecutorService {
    constructor(staffModel, userModel) {
        this.staffModel = staffModel;
        this.userModel = userModel;
    }
    resolveAssigneeValue(value) {
        if (!value)
            return '';
        if (typeof value === 'string')
            return value;
        if (typeof value === 'object' && value.username)
            return value.username;
        return '';
    }
    async resolveAssignee(node, instanceId, transaction) {
        const instance = await flow_instance_entity_1.FlowInstance.findByPk(instanceId, { transaction });
        if (!instance)
            throw new Error('实例不存在');
        switch (node.assigneeType) {
            case 'specified_user':
                return this.resolveAssigneeValue(node.assigneeValue);
            case 'specified_role': {
                const username = this.resolveAssigneeValue(node.assigneeValue);
                const user = await this.userModel.findOne({
                    where: { username },
                });
                return user?.username || '';
            }
            case 'superior': {
                const staff = await this.staffModel.findOne({
                    where: { staffName: instance.initiator },
                });
                return staff ? staff.staffName : instance.initiator;
            }
            case 'superior_level':
                return instance.initiator;
            case 'custom':
                return this.resolveAssigneeValue(node.assigneeValue);
            default:
                return '';
        }
    }
};
exports.NodeExecutorService = NodeExecutorService;
exports.NodeExecutorService = NodeExecutorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(staff_entity_1.Staff)),
    __param(1, (0, sequelize_1.InjectModel)(user_entity_1.User)),
    __metadata("design:paramtypes", [Object, Object])
], NodeExecutorService);
//# sourceMappingURL=node-executor.service.js.map