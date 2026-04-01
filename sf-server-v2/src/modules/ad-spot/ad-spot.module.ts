import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdSpot } from './ad-spot.entity';
import { AdSpotService } from './ad-spot.service';
import { AdSpotController } from './ad-spot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdSpot])],
  providers: [AdSpotService],
  controllers: [AdSpotController],
  exports: [AdSpotService],
})
export class AdSpotModule {}
