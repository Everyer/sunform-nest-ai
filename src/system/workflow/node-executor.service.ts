import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FlowTemplateNode } from './entities/flow-template-node.entity';
import { FlowInstance } from './entities/flow-instance.entity';
import { Staff } from '../staff/entities/staff.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NodeExecutorService {
  constructor(
    @InjectModel(Staff) private staffModel: typeof Staff,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  private resolveAssigneeValue(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.username) return value.username;
    return '';
  }

  async resolveAssignee(node: FlowTemplateNode, instanceId: string, transaction?: any): Promise<string> {
    const instance = await FlowInstance.findByPk(instanceId, { transaction });
    if (!instance) throw new Error('实例不存在');

    switch (node.assigneeType) {
      case 'specified_user':
        return this.resolveAssigneeValue(node.assigneeValue);
      case 'specified_role': {
        const username = this.resolveAssigneeValue(node.assigneeValue);
        const user = await this.userModel.findOne({
          where: { username },
        });
        return user?.username || '';
      }
      case 'superior': {
        const staff = await this.staffModel.findOne({
          where: { staffName: instance.initiator },
        });
        return staff ? staff.staffName : instance.initiator;
      }
      case 'superior_level':
        return instance.initiator;
      case 'custom':
        return this.resolveAssigneeValue(node.assigneeValue);
      default:
        return '';
    }
  }
}
