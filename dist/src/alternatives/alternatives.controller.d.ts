import { AlternativesService } from './alternatives.service';
import { CreateAlternativeDto, UpdateAlternativeDto } from './dto/alternative.dto';
export declare class AlternativesController {
    private readonly service;
    constructor(service: AlternativesService);
    create(dto: CreateAlternativeDto): Promise<import("./alternative.schema").AlternativeDocument>;
    findAll(): Promise<import("./alternative.schema").AlternativeDocument[]>;
    findOne(id: string): Promise<import("./alternative.schema").AlternativeDocument>;
    update(id: string, dto: UpdateAlternativeDto): Promise<import("./alternative.schema").AlternativeDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
