import { ProjectService } from '../services/project.service';
import { ProjectCreateDto, ProjectPageListDto, ProjectUpdateDto } from '../dto/project.dto';
export declare class ProjectController {
    private readonly service;
    constructor(service: ProjectService);
    create(dto: ProjectCreateDto): Promise<import("../entities").Project>;
    update(dto: ProjectUpdateDto): Promise<[affectedCount: number]>;
    list(dto: ProjectPageListDto): Promise<{
        list: import("../entities").Project[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<import("../entities").Project | null>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(request: any): Promise<import("../entities").Project[]>;
}
