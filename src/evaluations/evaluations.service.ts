import { Injectable, ConflictException } from '@nestjs/common';
import { EvaluationsRepository } from './evaluations.repository';
import { CreateEvaluationDto } from './dto/evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private readonly repo: EvaluationsRepository) {}

  async create(dto: CreateEvaluationDto) {
    const existing = await this.repo.findByPair(dto.alternativeId, dto.criterionId);
    if (existing) {
      throw new ConflictException(
        `Evaluation for alternative ${dto.alternativeId} and criterion ${dto.criterionId} already exists. Use PATCH to update.`,
      );
    }
    return this.repo.create(dto);
  }

  async findAll() {
    return this.repo.findAll();
  }
}
