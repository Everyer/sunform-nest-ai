import { BaseHasUserModel } from '../../../common/base.hasuser.entity';
import { Staff } from '../../../system/staff/entities/staff.entity';
import { UserSurvey } from '../../user-survey/entities/user-survey.entity';
export declare class Onboarding extends BaseHasUserModel {
    userSurveyId: string;
    userSurvey: UserSurvey;
    onboardingDate: Date;
    mobile: string;
    hrStaffId: string;
    hrStaff: Staff;
    source: string;
    location: string;
    rentalStatus: string;
    rentWithBattery: string;
    rentWithVehicle: string;
    rentalStaffId: string;
    rentalStaff: Staff;
    hasPhoneCard: boolean;
    paymentMethod: string;
    remark: string;
}
