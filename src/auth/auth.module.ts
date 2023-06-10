import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { Jwt2faStrategy } from './jwt-2fa.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '1d' }
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, Jwt2faStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
