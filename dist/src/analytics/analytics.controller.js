"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const RANKING_STRATEGIES = ['weighted_minmax', 'equal_minmax'];
let AnalyticsController = class AnalyticsController {
    constructor(service) {
        this.service = service;
    }
    getMatrix() {
        return this.service.getEvaluationMatrix();
    }
    calculateRankings(strategy) {
        const key = (strategy ?? 'weighted_minmax').trim().toLowerCase();
        if (!RANKING_STRATEGIES.includes(key)) {
            throw new common_1.BadRequestException({
                message: `Невідома стратегія. Допустимо: ${RANKING_STRATEGIES.join(', ')}`,
                allowed: RANKING_STRATEGIES,
            });
        }
        return this.service.calculateRankings(key);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('matrix'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getMatrix", null);
__decorate([
    (0, common_1.Get)('rankings'),
    __param(0, (0, common_1.Query)('strategy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "calculateRankings", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map