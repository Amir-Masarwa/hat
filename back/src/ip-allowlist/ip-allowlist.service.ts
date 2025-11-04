import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class IpAllowlistService {
  private readonly logFilePath = path.join(
    process.cwd(),
    'ip-denied-attempts.log',
  );

  constructor(private prisma: PrismaService) {}

  /**
   * Check if an IP is in the allow-list and active
   */
  async isIpAllowed(ip: string): Promise<boolean> {
    try {
      const record = await (this.prisma as any).ipAllowList.findUnique({
        where: { ip },
      });

      const allowed = record && record.isActive;
      return allowed;
    } catch (error) {
      console.error('Error checking IP allow-list:', error);
      return false;
    }
  }

  /**
   * Log denied login attempts
   */
  async logDeniedAttempt(
    ip: string,
    email: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const ua = userAgent ? ` | UserAgent: ${userAgent}` : '';
      const logEntry = `[${timestamp}] DENIED - IP: ${ip} | Email: ${email}${ua}\n`;

      await fs.appendFile(this.logFilePath, logEntry, 'utf8');

      console.log('🚫 Login Denied:');
      console.log('IP:', ip);
      console.log('Email:', email);
      console.log('User-Agent:', userAgent || 'N/A');
      console.log('---');
    } catch (error) {
      console.error('Failed to log denied attempt:', error);
    }
  }

  /**
   * Add an IP to the allow-list
   */
  async addIp(ip: string, label?: string) {
    return (this.prisma as any).ipAllowList.create({
      data: { ip, label },
    });
  }

  /**
   * Remove an IP from the allow-list (soft delete by setting isActive = false)
   */
  async removeIp(ip: string) {
    return (this.prisma as any).ipAllowList.update({
      where: { ip },
      data: { isActive: false },
    });
  }

  /**
   * Get all IPs in the allow-list (including inactive for admin)
   */
  async getAllIps() {
    return (this.prisma as any).ipAllowList.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Reactivate an IP
   */
  async activateIp(ip: string) {
    return (this.prisma as any).ipAllowList.update({
      where: { ip },
      data: { isActive: true },
    });
  }
}

