import { BaseModel } from '../../../common/base.entity';
export declare class Dict extends BaseModel {
    pid: string;
    label: string;
    value: string;
    status: boolean;
    sort: number;
    remark: string;
}
