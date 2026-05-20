import { BaseModel } from '../../../common/base.entity';
import { Menu } from '../../menu/entities/menu.entity';
import { Department } from '../../department/entities/department.entity';
export declare class Role extends BaseModel {
    roleName: string;
    roleKey: any;
    dataScope: string;
    status: boolean;
    sort: number;
    remark: string;
    menus: Menu[];
    departments: Department[];
}
