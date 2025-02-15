/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guard/role.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { jwtConstants } from './constants';

@Global()
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' }
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard
  ],
  exports: [
    UsersModule,
    AuthService,
    JwtModule,
    JwtAuthGuard,
    RolesGuard
  ]
})
export class AuthModule {}
