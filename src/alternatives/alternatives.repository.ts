import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alternative, AlternativeDocument } from './alternative.schema';
import { CreateAlternativeDto, UpdateAlternativeDto } from './dto/alternative.dto';

@Injectable()
export class AlternativesRepository {
  constructor(
    @InjectModel(Alternative.name)
    private readonly alternativeModel: Model<AlternativeDocument>,
  ) {}

  async create(dto: CreateAlternativeDto): Promise<AlternativeDocument> {
    return this.alternativeModel.create(dto);
  }

  async findAll(): Promise<AlternativeDocument[]> {
    return this.alternativeModel.find().exec();
  }

  async findById(id: string): Promise<AlternativeDocument | null> {
    return this.alternativeModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateAlternativeDto): Promise<AlternativeDocument | null> {
    return this.alternativeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async delete(id: string): Promise<AlternativeDocument | null> {
    return this.alternativeModel.findByIdAndDelete(id).exec();
  }
}
