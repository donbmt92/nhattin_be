/* eslint-disable prettier/prettier */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // console.log('JWT Payload:', payload);
    
    let user = await this.usersService.findOne(payload.sub);
    // console.log('Found User:', user);
    
    if (!user) {
        user = await this.usersService.findOne(payload.username);
        if(!user) {
            throw new UnauthorizedException('User not found');
        }
    }

    const result = {
      _id: user._id,
      phone: user.phone,
      role: user.role
    };

    // console.log('Validation Result:', result);
    return result;
  }
} 