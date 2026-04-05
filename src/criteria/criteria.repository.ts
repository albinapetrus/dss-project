import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Criterion, CriterionDocument } from './criterion.schema';
import { CreateCriterionDto, UpdateCriterionDto } from './dto/criterion.dto';

@Injectable()
export class CriteriaRepository {
  constructor(
    @InjectModel(Criterion.name)
    private readonly criterionModel: Model<CriterionDocument>,
  ) {}

  async create(dto: CreateCriterionDto): Promise<CriterionDocument> {
    return this.criterionModel.create(dto);
  }

  async findAll(): Promise<CriterionDocument[]> {
    return this.criterionModel.find().exec();
  }

  async findById(id: string): Promise<CriterionDocument | null> {
    return this.criterionModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateCriterionDto): Promise<CriterionDocument | null> {
    return this.criterionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async delete(id: string): Promise<CriterionDocument | null> {
    return this.criterionModel.findByIdAndDelete(id).exec();
  }
}
