import { Model } from 'mongoose';
import { ScenarioDocument } from './scenario.schema';
import { CreateScenarioDto, UpdateScenarioDto } from './dto/scenario.dto';
export declare class ScenariosRepository {
    private readonly model;
    constructor(model: Model<ScenarioDocument>);
    create(dto: CreateScenarioDto): Promise<ScenarioDocument>;
    findAll(): Promise<ScenarioDocument[]>;
    findById(id: string): Promise<ScenarioDocument | null>;
    update(id: string, dto: UpdateScenarioDto): Promise<ScenarioDocument | null>;
    delete(id: string): Promise<ScenarioDocument | null>;
}
