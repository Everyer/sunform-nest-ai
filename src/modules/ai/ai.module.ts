import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { SystemRulesService } from './utils/system-rules.service';
import { MessageManagerService, VueCodeManagerService } from './utils/message-manager.service';
import { AiLoggerService } from './utils/logger.service';
import { ContinuationDetectorService } from './utils/continuation-detector.service';

@Module({
  imports: [
    // 配置模块用于读取环境变量
    ConfigModule,
  ],
  controllers: [AiController],
  providers: [
    AiService,
    SystemRulesService,
    MessageManagerService,
    VueCodeManagerService,
    AiLoggerService,
    ContinuationDetectorService,
  ],
  exports: [
    // 导出服务供其他模块使用
    AiService,
    SystemRulesService,
    MessageManagerService,
    VueCodeManagerService,
    AiLoggerService,
    ContinuationDetectorService,
  ],
})
export class AiModule {}
