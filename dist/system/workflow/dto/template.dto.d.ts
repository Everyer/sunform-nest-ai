import { BasePageDto } from '../../../common/base.dto';
export declare class CreateTemplateDto {
    readonly name: string;
    readonly code: string;
    readonly category?: string;
    readonly description?: string;
    readonly formDefId?: string;
    readonly nodes?: any[];
    readonly edges?: any[];
    readonly nodePermissions?: any[];
    readonly config?: any;
}
export declare class UpdateTemplateDto extends CreateTemplateDto {
    readonly id: string;
}
export declare class TemplatePageListDto extends BasePageDto {
    readonly name?: string;
    readonly category?: string;
    readonly status?: number;
}
export declare class PublishTemplateDto {
    readonly id: string;
}
