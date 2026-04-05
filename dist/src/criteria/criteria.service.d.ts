import { CriteriaRepository } from './criteria.repository';
import { CreateCriterionDto, UpdateCriterionDto } from './dto/criterion.dto';
export declare class CriteriaService {
    private readonly repo;
    constructor(repo: CriteriaRepository);
    create(dto: CreateCriterionDto): Promise<import("./criterion.schema").CriterionDocument>;
    findAll(): Promise<import("./criterion.schema").CriterionDocument[]>;
    findOne(id: string): Promise<import("./criterion.schema").CriterionDocument>;
    update(id: string, dto: UpdateCriterionDto): Promise<import("./criterion.schema").CriterionDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
