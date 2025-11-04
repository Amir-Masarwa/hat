import { Module, Global } from '@nestjs/common';
import { IpAllowlistService } from './ip-allowlist.service';
import { IpAllowlistController } from './ip-allowlist.controller';
import { UsersModule } from '../users/users.module';
import { AdminGuard } from '../auth/guards/admin.guard';

@Global()
@Module({
  imports: [UsersModule],
  controllers: [IpAllowlistController],
  providers: [IpAllowlistService, AdminGuard],
  exports: [IpAllowlistService],
})
export class IpAllowlistModule {}

