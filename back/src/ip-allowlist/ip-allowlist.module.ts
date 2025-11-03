import { Module, Global } from '@nestjs/common';
import { IpAllowlistService } from './ip-allowlist.service';
import { IpAllowlistController } from './ip-allowlist.controller';

@Global()
@Module({
  controllers: [IpAllowlistController],
  providers: [IpAllowlistService],
  exports: [IpAllowlistService],
})
export class IpAllowlistModule {}

