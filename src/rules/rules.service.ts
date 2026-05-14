import { Injectable, NotFoundException } from '@nestjs/common';
import { RulesRepository } from './rules.repository';
import { CreateExpertRuleDto, UpdateExpertRuleDto } from './dto/rule.dto';

@Injectable()
export class RulesService {
  constructor(private readonly repo: RulesRepository) {}

  create(dto: CreateExpertRuleDto) {
    return this.repo.create(dto);
  }

  findAll() {
    return this.repo.findAll();
  }

  findEnabled() {
    return this.repo.findEnabled();
  }

  async findOne(id: string) {
    const r = await this.repo.findById(id);
    if (!r) throw new NotFoundException(`Rule #${id} not found`);
    return r;
  }

  async update(id: string, dto: UpdateExpertRuleDto) {
    const r = await this.repo.update(id, dto);
    if (!r) throw new NotFoundException(`Rule #${id} not found`);
    return r;
  }

  async remove(id: string) {
    const r = await this.repo.delete(id);
    if (!r) throw new NotFoundException(`Rule #${id} not found`);
    return { message: `Rule #${id} deleted` };
  }
}
