import { BaseHasUserModel } from '../../../common/base.hasuser.entity';
import { Project } from './project.entity';
export declare class Page extends BaseHasUserModel {
    pageName: string;
    isEnable: boolean;
    projectId: string;
    remark: string;
    project: Project;
}
