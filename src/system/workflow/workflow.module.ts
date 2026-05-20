import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FlowTemplate } from './entities/flow-template.entity';
import { FlowTemplateNode } from './entities/flow-template-node.entity';
import { FlowTemplateEdge } from './entities/flow-template-edge.entity';
import { FlowFormDef } from './entities/flow-form-def.entity';
import { FlowFormField } from './entities/flow-form-field.entity';
import { FlowInstance } from './entities/flow-instance.entity';
import { FlowInstanceNode } from './entities/flow-instance-node.entity';
import { FlowInstanceData } from './entities/flow-instance-data.entity';
import { FlowNodePermission } from './entities/flow-node-permission.entity';
import { TemplateController } from './template.controller';
import { FormDefController } from './form-def.controller';
import { InstanceController } from './instance.controller';
import { TaskController } from './task.controller';
import { TemplateService } from './template.service';
import { FormDefService } from './form-def.service';
import { InstanceService } from './instance.service';
import { TaskService } from './task.service';
import { NodeExecutorService } from './node-executor.service';
import { Staff } from '../staff/entities/staff.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      FlowTemplate,
      FlowTemplateNode,
      FlowTemplateEdge,
      FlowFormDef,
      FlowFormField,
      FlowInstance,
      FlowInstanceNode,
      FlowInstanceData,
      FlowNodePermission,
      Staff,
      User,
    ]),
  ],
  controllers: [TemplateController, FormDefController, InstanceController, TaskController],
  providers: [TemplateService, FormDefService, InstanceService, TaskService, NodeExecutorService],
})
export class WorkflowModule {}
