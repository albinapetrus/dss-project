export declare class CreateScenarioDto {
    name: string;
    description?: string;
    weightOverrides?: Record<string, number>;
    evaluationOverrides?: Record<string, number>;
    thresholdOverrides?: Record<string, {
        min?: number;
        max?: number;
    }>;
}
export declare class UpdateScenarioDto {
    name?: string;
    description?: string;
    weightOverrides?: Record<string, number>;
    evaluationOverrides?: Record<string, number>;
    thresholdOverrides?: Record<string, {
        min?: number;
        max?: number;
    }>;
}
