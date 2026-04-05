import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlternativesModule } from './alternatives/alternatives.module';
import { CriteriaModule } from './criteria/criteria.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb+srv://<user>:<password>@cluster.mongodb.net/dss',
    ),
    AlternativesModule,
    CriteriaModule,
    EvaluationsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
