import { Module } from '@nestjs/common';
import { CounsellorService } from './services/counsellor.service';
import { CounsellorController } from './controllers/counsellor.controller';
import { Counsellor } from './entities/counsellor.entity';
import { ChatModule } from '../chat/chat.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CounsellorAdminController } from './controllers/counsellor.admin.controller';
import { CounsellorSession } from './entities/counsellor.session.entity';
import { CounsellorMemberController } from './controllers/counsellor.member.controller';
import { CounsellorSessionService } from './services/counsellor.session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Counsellor, CounsellorSession]),
    ChatModule,
  ],
  controllers: [
    CounsellorController,
    CounsellorAdminController,
    CounsellorMemberController,
  ],
  providers: [CounsellorService, CounsellorSessionService],
  exports: [CounsellorService],
})
export class CounsellorModule {}
