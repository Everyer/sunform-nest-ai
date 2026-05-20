import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';
export declare class UserSurveyCreateDto extends BaseCreateDto {
    readonly name: string;
    readonly gender: string;
    readonly age: string;
    readonly mobile: string;
    readonly address?: string;
    readonly postIntention?: string;
    readonly needAccommodation: boolean;
    readonly needAccommodationAndTransportation: boolean;
    readonly remark?: string;
}
export declare class UserSurveyUpdateDto extends UserSurveyCreateDto {
    readonly id: string;
}
export declare class UserSurveyPageListDto extends BasePageDto {
    readonly name?: string;
    readonly gender?: string;
    readonly age?: string;
    readonly mobile?: string;
    readonly address?: string;
    readonly postIntention?: string;
    readonly createBy?: string;
}
