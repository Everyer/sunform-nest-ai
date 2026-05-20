import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './entities/role.entity';
import { RoleMenu } from './entities/role-menu.entity';
import { RoleDepartment } from './entities/role-department.entity';
@Module({
  imports: [SequelizeModule.forFeature([Role,RoleMenu,RoleDepartment])],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
