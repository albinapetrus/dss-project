import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Alternative, AlternativeSchema } from './alternative.schema';
import { AlternativesRepository } from './alternatives.repository';
import { AlternativesService } from './alternatives.service';
import { AlternativesController } from './alternatives.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Alternative.name, schema: AlternativeSchema }]),
  ],
  providers: [AlternativesRepository, AlternativesService],
  controllers: [AlternativesController],
  exports: [AlternativesService],
})
export class AlternativesModule {}
