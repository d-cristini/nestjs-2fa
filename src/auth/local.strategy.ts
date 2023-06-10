import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authenticationService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
    }

    async validate(email: string, password: string): Promise<Partial<User>> {
        const userWithoutPsw = await this.authenticationService.validateUser(email, password);
        if (!userWithoutPsw) {
            throw new UnauthorizedException();
        }
        return userWithoutPsw;
    }
}