import { CriterionType } from '../criterion.schema';
export declare class CreateCriterionDto {
    name: string;
    type: CriterionType;
    description?: string;
}
export declare class UpdateCriterionDto {
    name?: string;
    type?: CriterionType;
    description?: string;
}
