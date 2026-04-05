import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/evaluation.dto';
export declare class EvaluationsController {
    private readonly service;
    constructor(service: EvaluationsService);
    create(dto: CreateEvaluationDto): Promise<import("./evaluation.schema").EvaluationDocument>;
    findAll(): Promise<import("./evaluation.schema").EvaluationDocument[]>;
}
