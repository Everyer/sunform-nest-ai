import { UserSurveyService } from './user-survey.service';
import { UserSurveyCreateDto, UserSurveyPageListDto, UserSurveyUpdateDto } from './dto/create-user-survey.dto';
import { DataScopeService } from '../../system/auth/data-scope.service';
export declare class UserSurveyController {
    private readonly service;
    private readonly dataScope;
    constructor(service: UserSurveyService, dataScope: DataScopeService);
    create(dto: UserSurveyCreateDto, req: any): Promise<import("./entities/user-survey.entity").UserSurvey>;
    update(dto: UserSurveyUpdateDto): Promise<[affectedCount: number]>;
    list(dto: UserSurveyPageListDto, req: any): Promise<{
        list: import("./entities/user-survey.entity").UserSurvey[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("./entities/user-survey.entity").UserSurvey | null>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(): Promise<import("./entities/user-survey.entity").UserSurvey[]>;
}
