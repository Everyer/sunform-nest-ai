import { OnboardingCreateDto, OnboardingUpdateDto, OnboardingPageListDto } from './dto/create-onboarding.dto';
import { Onboarding } from './entities/onboarding.entity';
import { DictService } from '../../system/dict/dict.service';
export declare class OnboardingService {
    private model;
    private dictService;
    constructor(model: typeof Onboarding, dictService: DictService);
    create(CreateDto: OnboardingCreateDto): Promise<Onboarding>;
    findPageList(dto: OnboardingPageListDto, createByWhere?: any): Promise<{
        list: any[];
        total: number;
    }>;
    findAll(): Promise<Onboarding[]>;
    findOne(id: string): Promise<Onboarding | null>;
    update(dto: OnboardingUpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
}
