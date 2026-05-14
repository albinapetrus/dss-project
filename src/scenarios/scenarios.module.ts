import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Scenario, ScenarioSchema } from './scenario.schema';
import { ScenariosRepository } from './scenarios.repository';
import { ScenariosService } from './scenarios.service';
import { ScenariosController } from './scenarios.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Scenario.name, schema: ScenarioSchema }])],
  providers: [ScenariosRepository, ScenariosService],
  controllers: [ScenariosController],
  exports: [ScenariosService],
})
export class ScenariosModule {}
