import { CriterionType } from '../criterion.schema';
export declare class CreateCriterionDto {
    name: string;
    type: CriterionType;
    description?: string;
    weight?: number;
    scaleMin?: number;
    scaleMax?: number;
    thresholdMin?: number;
    thresholdMax?: number;
}
export declare class UpdateCriterionDto {
    name?: string;
    type?: CriterionType;
    description?: string;
    weight?: number;
    scaleMin?: number;
    scaleMax?: number;
    thresholdMin?: number;
    thresholdMax?: number;
}
