import { ProjectCreateDto, ProjectPageListDto, ProjectUpdateDto } from '../dto/project.dto';
import { Project } from '../entities/project.entity';
export declare class ProjectService {
    private model;
    constructor(model: typeof Project);
    create(createDto: ProjectCreateDto): Promise<Project>;
    findPageList(dto: ProjectPageListDto): Promise<{
        list: Project[];
        total: number;
    }>;
    findAll(userid: string): Promise<Project[]>;
    findOne(id: string): Promise<Project | null>;
    update(dto: ProjectUpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
}
