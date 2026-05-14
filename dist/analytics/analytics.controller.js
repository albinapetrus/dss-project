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
const FOLD = ['additive', 'cautious_min', 'multiplicative'];
const WEIGHT = ['weighted', 'equal'];
const LEGACY = ['weighted_minmax', 'equal_minmax'];
function parseFold(s) {
    const k = (s ?? 'additive').trim().toLowerCase();
    if (!FOLD.includes(k)) {
        throw new common_1.BadRequestException({ message: `Невідомий fold. Допустимо: ${FOLD.join(', ')}`, allowed: FOLD });
    }
    return k;
}
function parseWeightMode(s) {
    const k = (s ?? 'weighted').trim().toLowerCase();
    if (!WEIGHT.includes(k)) {
        throw new common_1.BadRequestException({ message: `Невідомий weightMode. Допустимо: ${WEIGHT.join(', ')}`, allowed: WEIGHT });
    }
    return k;
}
let AnalyticsController = class AnalyticsController {
    constructor(service) {
        this.service = service;
    }
    getMatrix() {
        return this.service.getEvaluationMatrix();
    }
    calculateRankings(fold, weightMode, scenarioId, strategy) {
        const legacy = strategy?.trim().toLowerCase();
        if (legacy && LEGACY.includes(legacy)) {
            const { fold: f, weightMode: w } = this.service.resolveLegacyStrategy(legacy);
            return this.service.calculateRankings(f, w, scenarioId);
        }
        return this.service.calculateRankings(parseFold(fold), parseWeightMode(weightMode), scenarioId);
    }
    rankingsCompare(weightMode, scenarioId) {
        return this.service.rankingsCompare(parseWeightMode(weightMode), scenarioId);
    }
    sensitivity(criterionId, from, to, steps, fold, weightMode) {
        if (!criterionId)
            throw new common_1.BadRequestException('Задайте criterionId');
        const f = parseFloat(from);
        const t = parseFloat(to);
        const st = parseInt(steps ?? '8', 10);
        return this.service.sensitivity(criterionId, f, t, st, parseFold(fold), parseWeightMode(weightMode));
    }
    stability(fold, weightMode, samples, relativeNoise) {
        const n = parseInt(samples ?? '25', 10);
        const rn = parseFloat(relativeNoise ?? '0.08');
        return this.service.stability(parseFold(fold), parseWeightMode(weightMode), n, rn);
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
    __param(0, (0, common_1.Query)('fold')),
    __param(1, (0, common_1.Query)('weightMode')),
    __param(2, (0, common_1.Query)('scenarioId')),
    __param(3, (0, common_1.Query)('strategy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "calculateRankings", null);
__decorate([
    (0, common_1.Get)('rankings-compare'),
    __param(0, (0, common_1.Query)('weightMode')),
    __param(1, (0, common_1.Query)('scenarioId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "rankingsCompare", null);
__decorate([
    (0, common_1.Get)('sensitivity'),
    __param(0, (0, common_1.Query)('criterionId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Query)('steps')),
    __param(4, (0, common_1.Query)('fold')),
    __param(5, (0, common_1.Query)('weightMode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "sensitivity", null);
__decorate([
    (0, common_1.Get)('stability'),
    __param(0, (0, common_1.Query)('fold')),
    __param(1, (0, common_1.Query)('weightMode')),
    __param(2, (0, common_1.Query)('samples')),
    __param(3, (0, common_1.Query)('relativeNoise')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "stability", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map