import { BaseHasUserModel } from '../../../common/base.hasuser.entity';
import { Project } from './project.entity';
import { Page } from './page.entity';
export declare class Component extends BaseHasUserModel {
    componentName: string;
    componentConfig: object;
    componentCode: string;
    componentType: string;
    isEnable: boolean;
    version: number;
    remark: string;
    operatorIds: string[];
    projectId: string;
    pageId: string;
    project: Project;
    page: Page;
}
