import { Model } from 'mongoose';
import { EvaluationDocument } from './evaluation.schema';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';
export declare class EvaluationsRepository {
    private readonly evaluationModel;
    constructor(evaluationModel: Model<EvaluationDocument>);
    create(dto: CreateEvaluationDto): Promise<EvaluationDocument>;
    findAll(): Promise<EvaluationDocument[]>;
    findByPair(alternativeId: string, criterionId: string): Promise<EvaluationDocument | null>;
    findById(id: string): Promise<EvaluationDocument | null>;
    update(id: string, dto: UpdateEvaluationDto): Promise<EvaluationDocument | null>;
    upsertByPair(alternativeId: string, criterionId: string, value: number): Promise<EvaluationDocument>;
}
