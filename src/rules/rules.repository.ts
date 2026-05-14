import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExpertRule, ExpertRuleDocument } from './expert-rule.schema';
import { CreateExpertRuleDto, UpdateExpertRuleDto } from './dto/rule.dto';

@Injectable()
export class RulesRepository {
  constructor(
    @InjectModel(ExpertRule.name)
    private readonly model: Model<ExpertRuleDocument>,
  ) {}

  create(dto: CreateExpertRuleDto): Promise<ExpertRuleDocument> {
    return this.model.create({
      ...dto,
      enabled: dto.enabled ?? true,
    });
  }

  findAll(): Promise<ExpertRuleDocument[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  findEnabled(): Promise<ExpertRuleDocument[]> {
    return this.model.find({ enabled: true }).exec();
  }

  findById(id: string): Promise<ExpertRuleDocument | null> {
    return this.model.findById(id).exec();
  }

  update(id: string, dto: UpdateExpertRuleDto): Promise<ExpertRuleDocument | null> {
    return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  delete(id: string): Promise<ExpertRuleDocument | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
