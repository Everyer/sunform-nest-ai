import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.findOneByUserPass(username, password);
        if (user) {
            return user;
        }
        return null;
    }

    async login(user: any) {
        const payload = user.toJSON();
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}