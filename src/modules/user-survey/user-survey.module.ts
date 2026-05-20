import { Module } from '@nestjs/common';
import { UserSurveyService } from './user-survey.service';
import { UserSurveyController } from './user-survey.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserSurvey } from './entities/user-survey.entity';
@Module({
  imports: [SequelizeModule.forFeature([UserSurvey])],
  controllers: [UserSurveyController],
  providers: [UserSurveyService],
})
export class UserSurveyModule {}
