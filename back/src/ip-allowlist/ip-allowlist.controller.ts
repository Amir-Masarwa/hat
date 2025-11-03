import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { IpAllowlistService } from './ip-allowlist.service';

@Controller('ip-allowlist')
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
}

