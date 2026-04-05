import { Injectable, NotFoundException } from '@nestjs/common';
import { CriteriaRepository } from './criteria.repository';
import { CreateCriterionDto, UpdateCriterionDto } from './dto/criterion.dto';

@Injectable()
export class CriteriaService {
  constructor(private readonly repo: CriteriaRepository) {}

  async create(dto: CreateCriterionDto) {
    return this.repo.create(dto);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException(`Criterion #${id} not found`);
    return found;
  }

  async update(id: string, dto: UpdateCriterionDto) {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException(`Criterion #${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundException(`Criterion #${id} not found`);
    return { message: `Criterion #${id} deleted successfully` };
  }
}
