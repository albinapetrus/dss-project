import { Model } from 'mongoose';
import { CriterionDocument } from './criterion.schema';
import { CreateCriterionDto, UpdateCriterionDto } from './dto/criterion.dto';
export declare class CriteriaRepository {
    private readonly criterionModel;
    constructor(criterionModel: Model<CriterionDocument>);
    create(dto: CreateCriterionDto): Promise<CriterionDocument>;
    findAll(): Promise<CriterionDocument[]>;
    findById(id: string): Promise<CriterionDocument | null>;
    update(id: string, dto: UpdateCriterionDto): Promise<CriterionDocument | null>;
    delete(id: string): Promise<CriterionDocument | null>;
}
