import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Access denied');
    }

    const fullUser: any = await this.usersService.findOne(user.userId);
    
    if (!fullUser || !fullUser.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

