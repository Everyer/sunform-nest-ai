import { BaseModel } from '../../../common/base.entity';
import { Department } from '../../department/entities/department.entity';
import { Post } from '../../post/entities/post.entity';
export declare class Staff extends BaseModel {
    deptId: string;
    department: Department;
    postId: string;
    post: Post;
    staffName: string;
    staffCode: string;
    mobile: string;
    gender: string;
    email: string;
    idCard: string;
    status: boolean;
    sort: number;
    remark: string;
}
