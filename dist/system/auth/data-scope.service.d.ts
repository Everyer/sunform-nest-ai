import { Role } from '../role/entities/role.entity';
import { Department } from '../department/entities/department.entity';
import { User } from '../user/entities/user.entity';
export declare class DataScopeService {
    private roleModel;
    private deptModel;
    private userModel;
    constructor(roleModel: typeof Role, deptModel: typeof Department, userModel: typeof User);
    getDeptIds(user: any): Promise<string[]>;
    getSubDeptIds(parentId: string): Promise<string[]>;
    buildDeptWhere(user: any): Promise<any>;
    buildCreateByWhere(user: any): Promise<any>;
}
