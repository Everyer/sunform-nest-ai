import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Onboarding } from './entities/onboarding.entity';
import { DictModule } from '../../system/dict/dict.module'
@Module({
  imports: [DictModule, SequelizeModule.forFeature([Onboarding])],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule { }
