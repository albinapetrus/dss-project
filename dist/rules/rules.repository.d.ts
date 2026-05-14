import { Model } from 'mongoose';
import { ExpertRuleDocument } from './expert-rule.schema';
import { CreateExpertRuleDto, UpdateExpertRuleDto } from './dto/rule.dto';
export declare class RulesRepository {
    private readonly model;
    constructor(model: Model<ExpertRuleDocument>);
    create(dto: CreateExpertRuleDto): Promise<ExpertRuleDocument>;
    findAll(): Promise<ExpertRuleDocument[]>;
    findEnabled(): Promise<ExpertRuleDocument[]>;
    findById(id: string): Promise<ExpertRuleDocument | null>;
    update(id: string, dto: UpdateExpertRuleDto): Promise<ExpertRuleDocument | null>;
    delete(id: string): Promise<ExpertRuleDocument | null>;
}
