import { Global, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '../role/entities/role.entity';
import { Department } from '../department/entities/department.entity';
import { User } from '../user/entities/user.entity';
import { DataScopeService } from './data-scope.service';

@Global()
@Module({
  imports: [SequelizeModule.forFeature([Role, Department, User])],
  providers: [DataScopeService],
  exports: [DataScopeService],
})
export class DataScopeModule {}
