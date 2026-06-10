import { Module } from '@nestjs/common';

// 提前注册 pgvector 类型，避免 Entity 加载时出现 DataType.VECTOR is not a function 错误
const SequelizeObjGlobal = require('sequelize');
const pgvector = require('pgvector/sequelize');
pgvector.registerTypes(SequelizeObjGlobal);

import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './system/auth/auth.module';
import { DataScopeModule } from './system/auth/data-scope.module';
import { StaffModule } from './system/staff/staff.module';
import { PostModule } from './system/post/post.module';
import { DepartmentModule } from './system/department/department.module';
import { MenuModule } from './system/menu/menu.module';
import { DictModule } from './system/dict/dict.module';
import { RoleModule } from './system/role/role.module';
import { UserModule } from './system/user/user.module';
import { UtilModule } from './util/util.module';
import { UserSurveyModule } from './modules/user-survey/user-survey.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { CacheModule } from '@nestjs/cache-manager';
import { WechatModule } from './modules/wechat/wechat.module';
import { LowcodeModule } from './modules/lowcode/lowcode.module';
import { AiModule } from './modules/ai/ai.module';
import { AgentModule } from './modules/agent/agent.module';
import { WorkflowModule } from './system/workflow/workflow.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { ImModule } from './modules/im/im.module';
import * as redisStore from 'cache-manager-redis-store';
import { existsSync } from 'fs';

@Module({
  imports: [
    // 配置模块 - 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true, // 全局可用
      envFilePath: '.env', // 环境变量文件路径
    }),

    // 静态资源配置 - 从 /static 路径提供
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/static',
    }),

    // 数据库配置 - 使用环境变量
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const Sequelize = require('sequelize');
        const pgvector = require('pgvector/sequelize');
        pgvector.registerTypes(Sequelize);

        return {
          dialect: 'postgres',
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          username: configService.get<string>('DATABASE_USERNAME'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          autoLoadModels: true,
          synchronize: configService.get('DB_SYNC') === 'true',
          sync: configService.get('DB_SYNC') === 'true' ? {
            alter: {
              drop: false, // 不删除列
            },
          } : undefined,
          define: {
            underscored: false, // 保持字段名与代码一致
            freezeTableName: true, // 我们将手动指定表名以确保兼容性
          },
          logging: false,
        };
      },
      inject: [ConfigService],
    }),

    // Redis缓存配置 - 使用环境变量
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: 0  // 永不过期
      }),
      inject: [ConfigService],
    }),

    DepartmentModule,
    PostModule,
    MenuModule,
    DictModule,
    StaffModule,
    RoleModule,
    UserModule,
    AuthModule,
    DataScopeModule,
    UtilModule,
    UserSurveyModule,
    OnboardingModule,
    WechatModule,
    LowcodeModule,
    AiModule,
    AgentModule,
    WorkflowModule,
    KnowledgeModule,
    ImModule
  ],
})
export class AppModule { }