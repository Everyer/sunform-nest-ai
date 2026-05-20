"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const SequelizeObjGlobal = require('sequelize');
const pgvector = require('pgvector/sequelize');
pgvector.registerTypes(SequelizeObjGlobal);
const sequelize_1 = require("@nestjs/sequelize");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./system/auth/auth.module");
const data_scope_module_1 = require("./system/auth/data-scope.module");
const staff_module_1 = require("./system/staff/staff.module");
const post_module_1 = require("./system/post/post.module");
const department_module_1 = require("./system/department/department.module");
const menu_module_1 = require("./system/menu/menu.module");
const dict_module_1 = require("./system/dict/dict.module");
const role_module_1 = require("./system/role/role.module");
const user_module_1 = require("./system/user/user.module");
const util_module_1 = require("./util/util.module");
const user_survey_module_1 = require("./modules/user-survey/user-survey.module");
const onboarding_module_1 = require("./modules/onboarding/onboarding.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const wechat_module_1 = require("./modules/wechat/wechat.module");
const lowcode_module_1 = require("./modules/lowcode/lowcode.module");
const ai_module_1 = require("./modules/ai/ai.module");
const agent_module_1 = require("./modules/agent/agent.module");
const workflow_module_1 = require("./system/workflow/workflow.module");
const knowledge_module_1 = require("./modules/knowledge/knowledge.module");
const redisStore = require("cache-manager-redis-store");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'public'),
                serveRoot: '/static',
            }),
            sequelize_1.SequelizeModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const Sequelize = require('sequelize');
                    const pgvector = require('pgvector/sequelize');
                    pgvector.registerTypes(Sequelize);
                    return {
                        dialect: 'postgres',
                        host: configService.get('DATABASE_HOST', '150.158.93.154'),
                        port: configService.get('DATABASE_PORT', 5432),
                        username: configService.get('DATABASE_USERNAME', 'postgres'),
                        password: configService.get('DATABASE_PASSWORD', '8uYabCRurjW2iXRH9IMZ'),
                        database: configService.get('DATABASE_NAME', 'postgres'),
                        autoLoadModels: true,
                        synchronize: configService.get('DB_SYNC') === 'true',
                        sync: configService.get('DB_SYNC') === 'true' ? {
                            alter: {
                                drop: false,
                            },
                        } : undefined,
                        define: {
                            underscored: false,
                            freezeTableName: true,
                        },
                        logging: false,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    store: redisStore,
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                    ttl: 0
                }),
                inject: [config_1.ConfigService],
            }),
            department_module_1.DepartmentModule,
            post_module_1.PostModule,
            menu_module_1.MenuModule,
            dict_module_1.DictModule,
            staff_module_1.StaffModule,
            role_module_1.RoleModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            data_scope_module_1.DataScopeModule,
            util_module_1.UtilModule,
            user_survey_module_1.UserSurveyModule,
            onboarding_module_1.OnboardingModule,
            wechat_module_1.WechatModule,
            lowcode_module_1.LowcodeModule,
            ai_module_1.AiModule,
            agent_module_1.AgentModule,
            workflow_module_1.WorkflowModule,
            knowledge_module_1.KnowledgeModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map