import { BasePageDto } from '../../../common/base.dto';
export declare class CreateFormDefDto {
    readonly name: string;
    readonly code: string;
    readonly sunformPageId?: string;
    readonly description?: string;
    readonly fields?: any[];
    readonly config?: any;
}
export declare class UpdateFormDefDto extends CreateFormDefDto {
    readonly id: string;
}
export declare class FormDefPageListDto extends BasePageDto {
    readonly name?: string;
    readonly code?: string;
}
