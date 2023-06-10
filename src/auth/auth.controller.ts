import { Controller, HttpCode, Post, UseGuards, Request, Req, Body, UnauthorizedException, Res, Get } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { User, UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Jwt2faAuthGuard } from './jwt-2fa-auth.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authSrv: AuthService, private readonly userSrv: UsersService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(200)
    async login(@Request() req) {
        const userWithoutPsw: Partial<User> = req.user;

        return this.authSrv.login(userWithoutPsw);
    }

    @Post('2fa/generate')
    @UseGuards(JwtAuthGuard)
    async register(@Res() response: Response,@Req() request) {
        const { otpauthUrl } = await this.authSrv.generateTwoFactorAuthenticationSecret(request.user);

        return this.authSrv.pipeQrCodeStream(response, otpauthUrl);
    }

    @Post('2fa/turn-on')
    @UseGuards(JwtAuthGuard)
    async turnOnTwoFactorAuthentication(@Req() request, @Body() body) {
        const isCodeValid =
            this.authSrv.isTwoFactorAuthenticationCodeValid(
                body.twoFactorAuthenticationCode,
                request.user,
            );
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        await this.userSrv.turnOnTwoFactorAuthentication(request.user.userId);
    }

    @Post('2fa/authenticate')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async authenticate(@Request() request, @Body() body) {
        const isCodeValid = this.authSrv.isTwoFactorAuthenticationCodeValid(
            body.twoFactorAuthenticationCode,
            request.user,
        );

        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }

        return this.authSrv.loginWith2fa(request.user);
    }

    @Get('me')
    @HttpCode(200)
    @UseGuards(Jwt2faAuthGuard)
    async user(@Request() request) {
        return this.userSrv.findOneByEmail(request.user.email);
    }

}
