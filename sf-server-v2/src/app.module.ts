import {
  ClassSerializerInterceptor,
  Module,
  MiddlewareConsumer,
  NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PetModule } from './modules/pet/pet.module';
import { FileModule } from './modules/file/file.module';
import { SocketModule } from './modules/socket/socket.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CaseModule } from './modules/case/case.module';
import { PartnerModule } from './modules/partner/partner.module';
import { VerifyModule } from './modules/verify/verify.module';
import { VetModule } from './modules/vet/vet.module';
import { MemberModule } from './modules/member/member.module';
import { AdminModule } from './modules/admin/admin.module';
import { CounsellorModule } from './modules/counsellor/counsellor.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import AppDataSource from './db/data-source';
import { MastermindGuard } from './guards/mastermind/mastermind.guard';
import { RedisModule } from './modules/redis/redis.module';
import { SmollCareModule } from './modules/smollcare/smoll-care.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { PaymentLogModule } from './modules/payment-log/payment-log.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { ServiceModule } from './modules/service/service.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { ClsContextService } from './utils/cls-context.service';
import { RequestContextMiddleware } from './middleware/request-context.middleware';
import * as dotenv from 'dotenv';

dotenv.config();
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        await AppDataSource.initialize();
        return AppDataSource.options;
      },
    }),
    ...(REDIS_ENABLED
      ? [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
              connection: {
                host: configService.get('REDIS_HOST', 'localhost'),
                port: configService.get('REDIS_PORT', 6379),
              },
            }),
            inject: [ConfigService],
          }),
        ]
      : []),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    VerifyModule,
    FileModule,
    PetModule,
    SocketModule,
    CaseModule,
    PartnerModule,
    AdminModule,
    MemberModule,
    VetModule,
    CounsellorModule,
    NotificationModule,
    RedisModule,
    SmollCareModule,
    PaymentLogModule,
    StripeModule,
    OrganizationModule,
    ServiceModule,
    ProductModule,
    OrderModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    MastermindGuard,
    ClsContextService,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
