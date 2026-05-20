"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LowcodeModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const project_entity_1 = require("./entities/project.entity");
const page_entity_1 = require("./entities/page.entity");
const component_entity_1 = require("./entities/component.entity");
const lowcode_log_entity_1 = require("./entities/lowcode-log.entity");
const config_entity_1 = require("./entities/config.entity");
const project_service_1 = require("./services/project.service");
const page_service_1 = require("./services/page.service");
const component_service_1 = require("./services/component.service");
const lowcode_log_service_1 = require("./services/lowcode-log.service");
const config_service_1 = require("./services/config.service");
const proxy_service_1 = require("./services/proxy.service");
const project_controller_1 = require("./controllers/project.controller");
const page_controller_1 = require("./controllers/page.controller");
const component_controller_1 = require("./controllers/component.controller");
const lowcode_log_controller_1 = require("./controllers/lowcode-log.controller");
const config_controller_1 = require("./controllers/config.controller");
const proxy_controller_1 = require("./controllers/proxy.controller");
const proxy_v2_controller_1 = require("./controllers/proxy-v2.controller");
let LowcodeModule = class LowcodeModule {
};
exports.LowcodeModule = LowcodeModule;
exports.LowcodeModule = LowcodeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                project_entity_1.Project,
                page_entity_1.Page,
                component_entity_1.Component,
                lowcode_log_entity_1.LowcodeLog,
                config_entity_1.LowcodeConfig
            ])
        ],
        controllers: [
            project_controller_1.ProjectController,
            page_controller_1.PageController,
            component_controller_1.ComponentController,
            lowcode_log_controller_1.LowcodeLogController,
            config_controller_1.ConfigController,
            proxy_controller_1.ProxyController,
            proxy_v2_controller_1.ProxyV2Controller
        ],
        providers: [
            project_service_1.ProjectService,
            page_service_1.PageService,
            component_service_1.ComponentService,
            lowcode_log_service_1.LowcodeLogService,
            config_service_1.ConfigService,
            proxy_service_1.ProxyService
        ],
        exports: [
            project_service_1.ProjectService,
            page_service_1.PageService,
            component_service_1.ComponentService,
            lowcode_log_service_1.LowcodeLogService,
            config_service_1.ConfigService,
            proxy_service_1.ProxyService
        ]
    })
], LowcodeModule);
//# sourceMappingURL=lowcode.module.js.map