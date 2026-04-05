import { AlternativesRepository } from './alternatives.repository';
import { CreateAlternativeDto, UpdateAlternativeDto } from './dto/alternative.dto';
export declare class AlternativesService {
    private readonly repo;
    constructor(repo: AlternativesRepository);
    create(dto: CreateAlternativeDto): Promise<import("./alternative.schema").AlternativeDocument>;
    findAll(): Promise<import("./alternative.schema").AlternativeDocument[]>;
    findOne(id: string): Promise<import("./alternative.schema").AlternativeDocument>;
    update(id: string, dto: UpdateAlternativeDto): Promise<import("./alternative.schema").AlternativeDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
