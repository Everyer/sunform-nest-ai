import { UserService } from './user.service';
import { UserCreateDto, UserPageListDto, UserUpdateDto } from './dto/create-user.dto';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    create(dto: UserCreateDto): Promise<import("./entities/user.entity").User>;
    update(dto: UserUpdateDto): Promise<[affectedCount: number]>;
    list(dto: UserPageListDto): Promise<{
        list: import("./entities/user.entity").User[];
        total: number;
    }>;
    detail(dto: {
        id: string;
    }): Promise<any>;
    delete(dto: {
        id: string;
    }): Promise<boolean>;
    findAll(): Promise<import("./entities/user.entity").User[]>;
}
