import { BaseModel } from '../../../common/base.entity';
export declare class Post extends BaseModel {
    postName: string;
    postCode: string;
    sort: number;
    status: boolean;
    remark: string;
}
