import { Model } from 'mongoose';
import { AlternativeDocument } from './alternative.schema';
import { CreateAlternativeDto, UpdateAlternativeDto } from './dto/alternative.dto';
export declare class AlternativesRepository {
    private readonly alternativeModel;
    constructor(alternativeModel: Model<AlternativeDocument>);
    create(dto: CreateAlternativeDto): Promise<AlternativeDocument>;
    findAll(): Promise<AlternativeDocument[]>;
    findById(id: string): Promise<AlternativeDocument | null>;
    update(id: string, dto: UpdateAlternativeDto): Promise<AlternativeDocument | null>;
    delete(id: string): Promise<AlternativeDocument | null>;
}
