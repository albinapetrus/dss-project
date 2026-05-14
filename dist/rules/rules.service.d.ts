import { RulesRepository } from './rules.repository';
import { CreateExpertRuleDto, UpdateExpertRuleDto } from './dto/rule.dto';
export declare class RulesService {
    private readonly repo;
    constructor(repo: RulesRepository);
    create(dto: CreateExpertRuleDto): Promise<import("./expert-rule.schema").ExpertRuleDocument>;
    findAll(): Promise<import("./expert-rule.schema").ExpertRuleDocument[]>;
    findEnabled(): Promise<import("./expert-rule.schema").ExpertRuleDocument[]>;
    findOne(id: string): Promise<import("./expert-rule.schema").ExpertRuleDocument>;
    update(id: string, dto: UpdateExpertRuleDto): Promise<import("./expert-rule.schema").ExpertRuleDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
