import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly service;
    constructor(service: AnalyticsService);
    calculateRankings(): {
        status: string;
        message: string;
    };
}
