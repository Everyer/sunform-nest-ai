import { FlowTemplateNode } from './entities/flow-template-node.entity';
import { Staff } from '../staff/entities/staff.entity';
import { User } from '../user/entities/user.entity';
export declare class NodeExecutorService {
    private staffModel;
    private userModel;
    constructor(staffModel: typeof Staff, userModel: typeof User);
    private resolveAssigneeValue;
    resolveAssignee(node: FlowTemplateNode, instanceId: string, transaction?: any): Promise<string>;
}
