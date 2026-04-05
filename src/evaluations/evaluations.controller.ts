import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/evaluation.dto';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly service: EvaluationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEvaluationDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
