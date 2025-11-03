import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { IpAllowlistModule } from './ip-allowlist/ip-allowlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    TasksModule,
    AuthModule,
    EmailModule,
    IpAllowlistModule,
  ],
})
export class AppModule {}

