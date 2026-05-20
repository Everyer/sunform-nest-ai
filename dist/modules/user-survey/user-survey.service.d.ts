import { UserSurveyCreateDto, UserSurveyPageListDto, UserSurveyUpdateDto } from './dto/create-user-survey.dto';
import { UserSurvey } from './entities/user-survey.entity';
export declare class UserSurveyService {
    private model;
    constructor(model: typeof UserSurvey);
    create(CreateDto: UserSurveyCreateDto): Promise<UserSurvey>;
    findPageList(dto: UserSurveyPageListDto, createByWhere?: any): Promise<{
        list: UserSurvey[];
        total: number;
    }>;
    findAll(): Promise<UserSurvey[]>;
    findOne(id: string): Promise<UserSurvey | null>;
    update(dto: UserSurveyUpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
}
