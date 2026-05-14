import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Scenario, ScenarioDocument } from './scenario.schema';
import { CreateScenarioDto, UpdateScenarioDto } from './dto/scenario.dto';

@Injectable()
export class ScenariosRepository {
  constructor(
    @InjectModel(Scenario.name)
    private readonly model: Model<ScenarioDocument>,
  ) {}

  create(dto: CreateScenarioDto): Promise<ScenarioDocument> {
    return this.model.create({
      name: dto.name,
      description: dto.description,
      weightOverrides: dto.weightOverrides ?? {},
      evaluationOverrides: dto.evaluationOverrides ?? {},
      thresholdOverrides: dto.thresholdOverrides ?? {},
    });
  }

  findAll(): Promise<ScenarioDocument[]> {
    return this.model.find().sort({ updatedAt: -1 }).exec();
  }

  findById(id: string): Promise<ScenarioDocument | null> {
    return this.model.findById(id).exec();
  }

  update(id: string, dto: UpdateScenarioDto): Promise<ScenarioDocument | null> {
    return this.model.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
  }

  delete(id: string): Promise<ScenarioDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
