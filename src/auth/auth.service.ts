import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { toDataURL } from 'qrcode';
import { User, UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {
    }

    async validateUser(email: string, pass: string): Promise<Partial<User>> {
        const user = await this.usersService.findOneByEmail(email);
        try {
            // Of course, we should consider encrypting the password
            const isMatch = pass === user.password;
            if (user && isMatch) {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }
        } catch (e) {
            return null;
        }
    }

    async login(userWithoutPsw: Partial<User>) {
        const payload = {
            email: userWithoutPsw.email,
        };

        return {
            email: payload.email,
            access_token: this.jwtService.sign(payload),
        };
    }

    async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();

        const otpauthUrl = authenticator.keyuri(user.email, 'DARX_TEST_APP', secret);

        await this.usersService.setTwoFactorAuthenticationSecret(secret, user.userId);

        return {
            secret,
            otpauthUrl
        }
    }

    async generateQrCodeDataURL(otpAuthUrl: string) {
        return toDataURL(otpAuthUrl);
    }

    async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
    }

    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: user.twoFactorAuthenticationSecret,
        });
    }

    async loginWith2fa(userWithoutPsw: Partial<User>) {
        const payload = {
            email: userWithoutPsw.email,
            isTwoFactorAuthenticationEnabled: !!userWithoutPsw.isTwoFactorAuthenticationEnabled,
            isTwoFactorAuthenticated: true,
        };

        return {
            email: payload.email,
            access_token: this.jwtService.sign(payload),
        };
    }
}