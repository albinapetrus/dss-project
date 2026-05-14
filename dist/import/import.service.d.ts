import { AlternativesService } from '../alternatives/alternatives.service';
import { CriteriaService } from '../criteria/criteria.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { CriterionVotingMethod, ExpertConsensusMethod, ImportCriterionVotesDto, ImportExpertEvaluationsDto } from './dto/import.dto';
export declare class ImportService {
    private readonly alternatives;
    private readonly criteria;
    private readonly evaluations;
    constructor(alternatives: AlternativesService, criteria: CriteriaService, evaluations: EvaluationsService);
    importExpertEvaluations(dto: ImportExpertEvaluationsDto): Promise<{
        method: ExpertConsensusMethod;
        pairsUpdated: number;
        expertRowsProcessed: number;
    }>;
    importCriterionVotes(dto: ImportCriterionVotesDto): Promise<{
        method: CriterionVotingMethod;
        criteriaUpdated: number;
        expertCount: number;
        rows: number;
    }>;
}
