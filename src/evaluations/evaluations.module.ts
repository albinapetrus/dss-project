import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Evaluation, EvaluationSchema } from './evaluation.schema';
import { EvaluationsRepository } from './evaluations.repository';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Evaluation.name, schema: EvaluationSchema }]),
  ],
  providers: [EvaluationsRepository, EvaluationsService],
  controllers: [EvaluationsController],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
