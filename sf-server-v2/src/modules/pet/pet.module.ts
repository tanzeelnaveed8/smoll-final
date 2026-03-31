import { forwardRef, Module } from '@nestjs/common';
import { PetService } from './services/pet.service';
import { PetController } from './controllers/pet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pet } from './entities/pet.entity';
import { PetHealthHistoryService } from './services/pet.health-history.service';
import { PetHealthHistory } from './entities/pet.health-history.entity';
import { PetHealthHistoryController } from './controllers/pet.health-history.controller';
import { SmollCareModule } from '../smollcare/smoll-care.module';
import { SmollCareSubscription } from '../smollcare/entities/smoll-care-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pet, PetHealthHistory, SmollCareSubscription]),
  forwardRef(() => SmollCareModule)
  ],
  controllers: [PetController, PetHealthHistoryController],
  providers: [PetService, PetHealthHistoryService],
  exports: [PetService, TypeOrmModule],
})
export class PetModule { }
