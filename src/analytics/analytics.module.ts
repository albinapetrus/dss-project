import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AlternativesModule } from '../alternatives/alternatives.module';
import { CriteriaModule } from '../criteria/criteria.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';

@Module({
  imports: [AlternativesModule, CriteriaModule, EvaluationsModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
