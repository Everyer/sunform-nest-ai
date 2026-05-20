import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

// 实体
import { Project } from './entities/project.entity';
import { Page } from './entities/page.entity';
import { Component } from './entities/component.entity';
import { LowcodeLog } from './entities/lowcode-log.entity';
import { LowcodeConfig } from './entities/config.entity';

// 服务
import { ProjectService } from './services/project.service';
import { PageService } from './services/page.service';
import { ComponentService } from './services/component.service';
import { LowcodeLogService } from './services/lowcode-log.service';
import { ConfigService } from './services/config.service';
import { ProxyService } from './services/proxy.service';

// 控制器
import { ProjectController } from './controllers/project.controller';
import { PageController } from './controllers/page.controller';
import { ComponentController } from './controllers/component.controller';
import { LowcodeLogController } from './controllers/lowcode-log.controller';
import { ConfigController } from './controllers/config.controller';
import { ProxyController } from './controllers/proxy.controller';
import { ProxyV2Controller } from './controllers/proxy-v2.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Project,
      Page, 
      Component,
      LowcodeLog,
      LowcodeConfig
    ])
  ],
  controllers: [
    ProjectController,
    PageController,
    ComponentController,
    LowcodeLogController,
    ConfigController,
    ProxyController,
    ProxyV2Controller
  ],
  providers: [
    ProjectService,
    PageService,
    ComponentService,
    LowcodeLogService,
    ConfigService,
    ProxyService
  ],
  exports: [
    ProjectService,
    PageService,
    ComponentService,
    LowcodeLogService,
    ConfigService,
    ProxyService
  ]
})
export class LowcodeModule {}
