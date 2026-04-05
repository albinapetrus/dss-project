import { EvaluationsRepository } from './evaluations.repository';
import { CreateEvaluationDto } from './dto/evaluation.dto';
export declare class EvaluationsService {
    private readonly repo;
    constructor(repo: EvaluationsRepository);
    create(dto: CreateEvaluationDto): Promise<import("./evaluation.schema").EvaluationDocument>;
    findAll(): Promise<import("./evaluation.schema").EvaluationDocument[]>;
}
