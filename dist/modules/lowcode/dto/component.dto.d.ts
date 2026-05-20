import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';
import { ComponentType } from '../constants/component.constants';
export declare class ComponentCreateDto extends BaseCreateDto {
    readonly componentName: string;
    readonly componentCode: string;
    readonly componentType: ComponentType;
    readonly componentConfig?: object;
    readonly projectId: string;
    readonly pageId: string;
    readonly isEnable: boolean;
    readonly version?: number;
    readonly remark?: string;
    readonly operatorIds?: string[];
}
export declare class ComponentUpdateDto extends ComponentCreateDto {
    readonly id: string;
}
export declare class ComponentPageListDto extends BasePageDto {
    readonly componentName?: string;
    readonly componentCode?: string;
    readonly componentType?: ComponentType;
    readonly projectId?: string;
    readonly pageId?: string;
    readonly isEnable?: boolean;
    readonly createBy?: string;
}
export declare class GetConfigByOtherProjectDto {
    readonly projectId: string;
    readonly componentId?: string;
    readonly componentCode?: string;
}
export declare class UpdateOperatorsDto {
    readonly id: string;
    readonly operatorIds: string[];
}
