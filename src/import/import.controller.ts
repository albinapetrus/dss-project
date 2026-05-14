import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportCriterionVotesDto, ImportExpertEvaluationsDto } from './dto/import.dto';

@Controller('import')
export class ImportController {
  constructor(private readonly service: ImportService) {}

  @Post('expert-evaluations')
  @HttpCode(HttpStatus.OK)
  importExperts(@Body() dto: ImportExpertEvaluationsDto) {
    return this.service.importExpertEvaluations(dto);
  }

  @Post('criterion-votes')
  @HttpCode(HttpStatus.OK)
  importVotes(@Body() dto: ImportCriterionVotesDto) {
    return this.service.importCriterionVotes(dto);
  }
}
