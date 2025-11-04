import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { IpAllowlistService } from './ip-allowlist.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('ip-allowlist')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class IpAllowlistController {
  constructor(private readonly ipAllowlistService: IpAllowlistService) {}

  @Get()
  async getAll() {
    return this.ipAllowlistService.getAllIps();
  }

  @Post()
  async addIp(@Body('ip') ip: string, @Body('label') label?: string) {
    return this.ipAllowlistService.addIp(ip, label);
  }

  @Delete(':ip')
  async removeIp(@Param('ip') ip: string) {
    return this.ipAllowlistService.removeIp(ip);
  }

  @Post(':ip/activate')
  async activateIp(@Param('ip') ip: string) {
    return (await this.ipAllowlistService as any).activateIp(ip);
  }
}

