import { BaseHasUserModel } from '../../../common/base.hasuser.entity';
export declare class UserSurvey extends BaseHasUserModel {
    name: string;
    gender: string;
    age: string;
    mobile: string;
    address: string;
    postIntention: string;
    needAccommodation: boolean;
    needAccommodationAndTransportation: boolean;
    remark: string;
}
