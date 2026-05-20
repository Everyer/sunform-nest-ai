import { OnboardingService } from './onboarding.service';
import { OnboardingCreateDto, OnboardingUpdateDto, OnboardingPageListDto } from './dto/create-onboarding.dto';
import { DataScopeService } from '../../system/auth/data-scope.service';
export declare class OnboardingController {
    private readonly service;
    private readonly dataScope;
    constructor(service: OnboardingService, dataScope: DataScopeService);
    create(dto: OnboardingCreateDto, req: any): Promise<import("./entities/onboarding.entity").Onboarding>;
    update(dto: OnboardingUpdateDto): Promise<[affectedCount: number]>;
    list(dto: OnboardingPageListDto, req: any): Promise<{
        list: any[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("./entities/onboarding.entity").Onboarding | null>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(): Promise<import("./entities/onboarding.entity").Onboarding[]>;
}
