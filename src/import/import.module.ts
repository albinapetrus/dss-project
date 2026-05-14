import { Module } from '@nestjs/common';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { AlternativesModule } from '../alternatives/alternatives.module';
import { CriteriaModule } from '../criteria/criteria.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';

@Module({
  imports: [AlternativesModule, CriteriaModule, EvaluationsModule],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
