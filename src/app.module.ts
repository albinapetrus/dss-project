import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlternativesModule } from './alternatives/alternatives.module';
import { CriteriaModule } from './criteria/criteria.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dss'),
    AlternativesModule,
    CriteriaModule,
    EvaluationsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
