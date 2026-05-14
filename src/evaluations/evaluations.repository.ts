import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation, EvaluationDocument } from './evaluation.schema';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';

@Injectable()
export class EvaluationsRepository {
  constructor(
    @InjectModel(Evaluation.name)
    private readonly evaluationModel: Model<EvaluationDocument>,
  ) {}

  async create(dto: CreateEvaluationDto): Promise<EvaluationDocument> {
    return this.evaluationModel.create(dto);
  }

  async findAll(): Promise<EvaluationDocument[]> {
    return this.evaluationModel
      .find()
      .populate('alternativeId', 'name description')
      .populate('criterionId', 'name type description')
      .exec();
  }

  async findByPair(alternativeId: string, criterionId: string): Promise<EvaluationDocument | null> {
    return this.evaluationModel.findOne({ alternativeId, criterionId }).exec();
  }

  async findById(id: string): Promise<EvaluationDocument | null> {
    return this.evaluationModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateEvaluationDto): Promise<EvaluationDocument | null> {
    return this.evaluationModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .populate('alternativeId', 'name description')
      .populate('criterionId', 'name type description')
      .exec();
  }

  async upsertByPair(
    alternativeId: string,
    criterionId: string,
    value: number,
  ): Promise<EvaluationDocument> {
    return this.evaluationModel
      .findOneAndUpdate(
        { alternativeId, criterionId },
        { $set: { alternativeId, criterionId, value } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .populate('alternativeId', 'name description')
      .populate('criterionId', 'name type description')
      .exec() as Promise<EvaluationDocument>;
  }
}
