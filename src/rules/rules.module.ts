import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpertRule, ExpertRuleSchema } from './expert-rule.schema';
import { RulesRepository } from './rules.repository';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ExpertRule.name, schema: ExpertRuleSchema }])],
  providers: [RulesRepository, RulesService],
  controllers: [RulesController],
  exports: [RulesService],
})
export class RulesModule {}
