import { ImportService } from './import.service';
import { ImportCriterionVotesDto, ImportExpertEvaluationsDto } from './dto/import.dto';
export declare class ImportController {
    private readonly service;
    constructor(service: ImportService);
    importExperts(dto: ImportExpertEvaluationsDto): Promise<{
        method: import("./dto/import.dto").ExpertConsensusMethod;
        pairsUpdated: number;
        expertRowsProcessed: number;
    }>;
    importVotes(dto: ImportCriterionVotesDto): Promise<{
        method: import("./dto/import.dto").CriterionVotingMethod;
        criteriaUpdated: number;
        expertCount: number;
        rows: number;
    }>;
}
