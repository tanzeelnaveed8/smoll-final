import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from './notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetListener } from './listeners/vet.listener';
import { CounsellorListener } from './listeners/counsellor.listener';
import { CounsellorModule } from '../counsellor/counsellor.module';
import { PartnerListener } from './listeners/partner.listener';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Notification]), CounsellorModule],
  controllers: [NotificationController],
  providers: [
    CounsellorListener,
    VetListener,
    PartnerListener,
    NotificationService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
