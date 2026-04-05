import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Criterion, CriterionSchema } from './criterion.schema';
import { CriteriaRepository } from './criteria.repository';
import { CriteriaService } from './criteria.service';
import { CriteriaController } from './criteria.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Criterion.name, schema: CriterionSchema }]),
  ],
  providers: [CriteriaRepository, CriteriaService],
  controllers: [CriteriaController],
  exports: [CriteriaService],
})
export class CriteriaModule {}
