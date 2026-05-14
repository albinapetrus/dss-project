import { Injectable, NotFoundException } from '@nestjs/common';
import { ScenariosRepository } from './scenarios.repository';
import { CreateScenarioDto, UpdateScenarioDto } from './dto/scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(private readonly repo: ScenariosRepository) {}

  create(dto: CreateScenarioDto) {
    return this.repo.create(dto);
  }

  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string) {
    const s = await this.repo.findById(id);
    if (!s) throw new NotFoundException(`Scenario #${id} not found`);
    return s;
  }

  async update(id: string, dto: UpdateScenarioDto) {
    const s = await this.repo.update(id, dto);
    if (!s) throw new NotFoundException(`Scenario #${id} not found`);
    return s;
  }

  async remove(id: string) {
    const s = await this.repo.delete(id);
    if (!s) throw new NotFoundException(`Scenario #${id} not found`);
    return { message: `Scenario #${id} deleted` };
  }
}
