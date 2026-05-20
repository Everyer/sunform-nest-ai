"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ai_controller_1 = require("./ai.controller");
const ai_service_1 = require("./ai.service");
const system_rules_service_1 = require("./utils/system-rules.service");
const message_manager_service_1 = require("./utils/message-manager.service");
const logger_service_1 = require("./utils/logger.service");
const continuation_detector_service_1 = require("./utils/continuation-detector.service");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
        ],
        controllers: [ai_controller_1.AiController],
        providers: [
            ai_service_1.AiService,
            system_rules_service_1.SystemRulesService,
            message_manager_service_1.MessageManagerService,
            message_manager_service_1.VueCodeManagerService,
            logger_service_1.AiLoggerService,
            continuation_detector_service_1.ContinuationDetectorService,
        ],
        exports: [
            ai_service_1.AiService,
            system_rules_service_1.SystemRulesService,
            message_manager_service_1.MessageManagerService,
            message_manager_service_1.VueCodeManagerService,
            logger_service_1.AiLoggerService,
            continuation_detector_service_1.ContinuationDetectorService,
        ],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map