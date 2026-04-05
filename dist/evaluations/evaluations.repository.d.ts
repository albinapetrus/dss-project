import { Model } from 'mongoose';
import { EvaluationDocument } from './evaluation.schema';
import { CreateEvaluationDto } from './dto/evaluation.dto';
export declare class EvaluationsRepository {
    private readonly evaluationModel;
    constructor(evaluationModel: Model<EvaluationDocument>);
    create(dto: CreateEvaluationDto): Promise<EvaluationDocument>;
    findAll(): Promise<EvaluationDocument[]>;
    findByPair(alternativeId: string, criterionId: string): Promise<EvaluationDocument | null>;
}
