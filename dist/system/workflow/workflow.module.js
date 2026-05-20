"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const flow_template_entity_1 = require("./entities/flow-template.entity");
const flow_template_node_entity_1 = require("./entities/flow-template-node.entity");
const flow_template_edge_entity_1 = require("./entities/flow-template-edge.entity");
const flow_form_def_entity_1 = require("./entities/flow-form-def.entity");
const flow_form_field_entity_1 = require("./entities/flow-form-field.entity");
const flow_instance_entity_1 = require("./entities/flow-instance.entity");
const flow_instance_node_entity_1 = require("./entities/flow-instance-node.entity");
const flow_instance_data_entity_1 = require("./entities/flow-instance-data.entity");
const flow_node_permission_entity_1 = require("./entities/flow-node-permission.entity");
const template_controller_1 = require("./template.controller");
const form_def_controller_1 = require("./form-def.controller");
const instance_controller_1 = require("./instance.controller");
const task_controller_1 = require("./task.controller");
const template_service_1 = require("./template.service");
const form_def_service_1 = require("./form-def.service");
const instance_service_1 = require("./instance.service");
const task_service_1 = require("./task.service");
const node_executor_service_1 = require("./node-executor.service");
const staff_entity_1 = require("../staff/entities/staff.entity");
const user_entity_1 = require("../user/entities/user.entity");
let WorkflowModule = class WorkflowModule {
};
exports.WorkflowModule = WorkflowModule;
exports.WorkflowModule = WorkflowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                flow_template_entity_1.FlowTemplate,
                flow_template_node_entity_1.FlowTemplateNode,
                flow_template_edge_entity_1.FlowTemplateEdge,
                flow_form_def_entity_1.FlowFormDef,
                flow_form_field_entity_1.FlowFormField,
                flow_instance_entity_1.FlowInstance,
                flow_instance_node_entity_1.FlowInstanceNode,
                flow_instance_data_entity_1.FlowInstanceData,
                flow_node_permission_entity_1.FlowNodePermission,
                staff_entity_1.Staff,
                user_entity_1.User,
            ]),
        ],
        controllers: [template_controller_1.TemplateController, form_def_controller_1.FormDefController, instance_controller_1.InstanceController, task_controller_1.TaskController],
        providers: [template_service_1.TemplateService, form_def_service_1.FormDefService, instance_service_1.InstanceService, task_service_1.TaskService, node_executor_service_1.NodeExecutorService],
    })
], WorkflowModule);
//# sourceMappingURL=workflow.module.js.map