import { BaseModel } from '../../../common/base.entity';
import { Staff } from '../../staff/entities/staff.entity';
export declare class Department extends BaseModel {
    staffs: Staff[];
    pid: string;
    departmentName: string;
    leader: string;
    status: boolean;
    sort: number;
    remark: string;
}
