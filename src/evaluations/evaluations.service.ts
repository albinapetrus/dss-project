import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { EvaluationsRepository } from './evaluations.repository';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';

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

  async update(id: string, dto: UpdateEvaluationDto) {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException(`Evaluation #${id} not found`);
    return updated;
  }

  async upsertPair(alternativeId: string, criterionId: string, value: number) {
    return this.repo.upsertByPair(alternativeId, criterionId, value);
  }
}
