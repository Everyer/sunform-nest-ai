import { UserCreateDto, UserPageListDto, UserUpdateDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { StaffService } from '../staff/staff.service';
export declare class UserService {
    private model;
    private staffService;
    constructor(model: typeof User, staffService: StaffService);
    create(CreateDto: UserCreateDto): Promise<User>;
    findPageList(dto: UserPageListDto): Promise<{
        list: User[];
        total: number;
    }>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<any>;
    findOneByUserPass(username: string, password: string): Promise<User | null>;
    update(dto: UserUpdateDto): Promise<[affectedCount: number]>;
    remove(id: string): Promise<boolean>;
}
