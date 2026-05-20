import { BasePageDto, BaseCreateDto } from '../../../common/base.dto';
export declare class OnboardingCreateDto extends BaseCreateDto {
    readonly userSurveyId: string;
    readonly onboardingDate: Date;
    readonly mobile: string;
    readonly hrStaffId: string;
    readonly source?: string;
    readonly location: string;
    readonly rentalStatus: string;
    readonly rentWithBattery?: string;
    readonly rentWithVehicle?: string;
    readonly rentalStaffId: string;
    readonly hasPhoneCard: boolean;
    readonly paymentMethod: string;
    readonly remark?: string;
}
export declare class OnboardingUpdateDto extends OnboardingCreateDto {
    readonly id: string;
}
export declare class OnboardingPageListDto extends BasePageDto {
    readonly userSurveyId?: string;
    readonly onboardingDate?: Date;
    readonly mobile?: string;
    readonly hrStaffId?: string;
    readonly location?: string;
    readonly rentalStatus?: string;
    readonly rentalStaffId?: string;
    readonly hasPhoneCard?: boolean;
}
