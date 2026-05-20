import { BaseModel } from '../../../common/base.entity';
export declare class Menu extends BaseModel {
    pid: string;
    name: string;
    code: string;
    isNav: boolean;
    type: string;
    icon: string;
    path: string;
    component: string;
    lowCodeCode: string;
    status: boolean;
    sort: number;
    remark: string;
}
