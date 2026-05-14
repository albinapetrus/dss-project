import { ScenariosService } from './scenarios.service';
import { CreateScenarioDto, UpdateScenarioDto } from './dto/scenario.dto';
export declare class ScenariosController {
    private readonly service;
    constructor(service: ScenariosService);
    create(dto: CreateScenarioDto): Promise<import("./scenario.schema").ScenarioDocument>;
    findAll(): Promise<import("./scenario.schema").ScenarioDocument[]>;
    findOne(id: string): Promise<import("./scenario.schema").ScenarioDocument>;
    update(id: string, dto: UpdateScenarioDto): Promise<import("./scenario.schema").ScenarioDocument>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
