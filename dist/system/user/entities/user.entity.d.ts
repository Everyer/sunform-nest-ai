import { BaseModel } from '../../../common/base.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Department } from '../../department/entities/department.entity';
import { Role } from '../../role/entities/role.entity';
export declare class User extends BaseModel {
    username: string;
    password: string;
    staffId: string;
    staff: Staff;
    deptId: string;
    department: Department;
    dataScope: string;
    sort: number;
    status: boolean;
    remark: string;
    roles: Role[];
}
