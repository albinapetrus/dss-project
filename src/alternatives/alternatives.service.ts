import { Injectable, NotFoundException } from '@nestjs/common';
import { AlternativesRepository } from './alternatives.repository';
import { CreateAlternativeDto, UpdateAlternativeDto } from './dto/alternative.dto';

@Injectable()
export class AlternativesService {
  constructor(private readonly repo: AlternativesRepository) {}

  async create(dto: CreateAlternativeDto) {
    return this.repo.create(dto);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException(`Alternative #${id} not found`);
    return found;
  }

  async update(id: string, dto: UpdateAlternativeDto) {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException(`Alternative #${id} not found`);
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new NotFoundException(`Alternative #${id} not found`);
    return { message: `Alternative #${id} deleted successfully` };
  }
}
