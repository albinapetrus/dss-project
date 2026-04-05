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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const alternatives_service_1 = require("../alternatives/alternatives.service");
const criteria_service_1 = require("../criteria/criteria.service");
const evaluations_service_1 = require("../evaluations/evaluations.service");
const criterion_schema_1 = require("../criteria/criterion.schema");
function refId(ref) {
    if (typeof ref === 'string')
        return ref;
    return ref._id.toString();
}
function criterionWeight(raw, strategy) {
    if (strategy === 'equal_minmax')
        return 1;
    const w = raw ?? 1;
    return w > 0 ? w : 1;
}
let AnalyticsService = class AnalyticsService {
    constructor(alternatives, criteria, evaluations) {
        this.alternatives = alternatives;
        this.criteria = criteria;
        this.evaluations = evaluations;
    }
    async getEvaluationMatrix() {
        const [alts, crits, evals] = await Promise.all([
            this.alternatives.findAll(),
            this.criteria.findAll(),
            this.evaluations.findAll(),
        ]);
        const valueByPair = new Map();
        for (const e of evals) {
            const aid = refId(e.alternativeId);
            const cid = refId(e.criterionId);
            valueByPair.set(`${aid}:${cid}`, e.value);
        }
        const rows = alts.map((a) => {
            const aid = a._id.toString();
            const cells = crits.map((c) => {
                const cid = c._id.toString();
                const key = `${aid}:${cid}`;
                const w = c.weight ?? 1;
                return {
                    criterionId: cid,
                    criterionName: c.name,
                    criterionType: c.type,
                    weight: w,
                    value: valueByPair.has(key) ? valueByPair.get(key) : null,
                };
            });
            return {
                alternativeId: aid,
                alternativeName: a.name,
                cells,
            };
        });
        return {
            alternatives: alts.map((a) => ({
                id: a._id.toString(),
                name: a.name,
                description: a.description,
            })),
            criteria: crits.map((c) => ({
                id: c._id.toString(),
                name: c.name,
                type: c.type,
                description: c.description,
                weight: c.weight ?? 1,
            })),
            rows,
            stats: {
                alternativesCount: alts.length,
                criteriaCount: crits.length,
                evaluationsCount: evals.length,
                expectedCells: alts.length * crits.length,
                filledCells: valueByPair.size,
            },
        };
    }
    async calculateRankings(strategy = 'weighted_minmax') {
        const matrix = await this.getEvaluationMatrix();
        const { alternatives, criteria, rows } = matrix;
        if (alternatives.length === 0 || criteria.length === 0) {
            return {
                strategy,
                method: 'Мінімакс-нормалізація значень по кожному критерію; інтегральний бал = Σ(wᵢ·ñᵢ) / Σ(wᵢ), де ñᵢ ∈ [0,1].',
                message: 'Немає альтернатив або критеріїв для ранжування.',
                rankings: [],
                bestAlternative: null,
                explanation: null,
                matrix,
            };
        }
        const missing = [];
        for (const row of rows) {
            const miss = row.cells.filter((c) => c.value === null).map((c) => c.criterionId);
            if (miss.length) {
                missing.push({
                    alternativeId: row.alternativeId,
                    alternativeName: row.alternativeName,
                    missingCriterionIds: miss,
                });
            }
        }
        if (missing.length > 0) {
            throw new common_1.UnprocessableEntityException({
                message: 'Матриця оцінювання неповна: для ранжування потрібні всі пари (альтернатива, критерій).',
                incomplete: missing,
                matrix,
            });
        }
        const critList = criteria.map((c) => c.id);
        const colValues = new Map();
        for (const cid of critList) {
            colValues.set(cid, rows.map((r) => r.cells.find((x) => x.criterionId === cid).value));
        }
        const critMeta = new Map(criteria.map((c) => [c.id, c]));
        const normalizedRows = rows.map((row) => {
            const normalizedByCriterion = {};
            for (const cell of row.cells) {
                const cid = cell.criterionId;
                const vals = colValues.get(cid) ?? [];
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                const v = cell.value;
                const type = critMeta.get(cid)?.type ?? criterion_schema_1.CriterionType.MAXIMIZE;
                let n = 1;
                if (max > min) {
                    n =
                        type === criterion_schema_1.CriterionType.MINIMIZE
                            ? (max - v) / (max - min)
                            : (v - min) / (max - min);
                }
                normalizedByCriterion[cid] = { raw: v, normalized: Number(n.toFixed(6)) };
            }
            let numerator = 0;
            let denom = 0;
            for (const cid of critList) {
                const c = critMeta.get(cid);
                const w = criterionWeight(c.weight, strategy);
                const n = normalizedByCriterion[cid].normalized;
                numerator += w * n;
                denom += w;
            }
            const score = denom > 0 ? numerator / denom : 0;
            return {
                alternativeId: row.alternativeId,
                alternativeName: row.alternativeName,
                score: Number(score.toFixed(6)),
                normalizedByCriterion,
            };
        });
        const sorted = [...normalizedRows].sort((a, b) => b.score - a.score);
        const rankings = sorted.map((r, i) => ({
            rank: i + 1,
            alternativeId: r.alternativeId,
            alternativeName: r.alternativeName,
            score: r.score,
        }));
        const best = sorted[0];
        const strategyLabelUk = strategy === 'weighted_minmax'
            ? 'зважені ваги критеріїв (поле weight)'
            : 'рівні ваги всіх критеріїв (ваги ігноруються)';
        const methodUk = strategy === 'weighted_minmax'
            ? 'Мінімакс-нормалізація по стовпцях; інтегральна оцінка = зважене середнє нормалізованих значень Σ(wᵢ·ñᵢ)/Σ(wᵢ).'
            : 'Мінімакс-нормалізація по стовпцях; інтегральна оцінка = просте середнє нормалізованих значень (усі wᵢ=1).';
        const explanation = this.buildExplanationUk(best, criteria, strategy, strategyLabelUk);
        return {
            strategy,
            method: methodUk,
            howToRead: 'Бал ∈ [0; 1]: 1 означає найкраще значення в групі альтернатив за відповідним критерієм після нормалізації; інтегральний бал — згортка з урахуванням обраної стратегії ваг.',
            rankings,
            bestAlternative: best
                ? {
                    rank: 1,
                    alternativeId: best.alternativeId,
                    alternativeName: best.alternativeName,
                    score: best.score,
                }
                : null,
            explanation,
            detail: sorted.map((r) => ({
                alternativeId: r.alternativeId,
                alternativeName: r.alternativeName,
                score: r.score,
                normalizedByCriterion: r.normalizedByCriterion,
            })),
            matrix,
        };
    }
    buildExplanationUk(best, criteria, strategy, strategyLabelUk) {
        const b = best;
        if (!b)
            return null;
        const parts = criteria.map((c) => {
            const w = criterionWeight(c.weight, strategy);
            const cell = b.normalizedByCriterion[c.id];
            const n = cell.normalized;
            return {
                criterionId: c.id,
                criterionName: c.name,
                weightUsed: w,
                rawValue: cell.raw,
                normalized: n,
                product: w * n,
            };
        });
        const sumProducts = parts.reduce((s, p) => s + p.product, 0) || 1;
        const contributions = parts.map((p) => ({
            criterionId: p.criterionId,
            criterionName: p.criterionName,
            weightUsed: p.weightUsed,
            rawValue: p.rawValue,
            normalized: p.normalized,
            shareOfWeightedSumPercent: Number(((100 * p.product) / sumProducts).toFixed(2)),
        }));
        const topDrivers = [...contributions].sort((a, b) => b.shareOfWeightedSumPercent - a.shareOfWeightedSumPercent);
        const namesTop = topDrivers.slice(0, 2).map((x) => `«${x.criterionName}»`);
        const summary = `За стратегією згортки (${strategyLabelUk}) найкращою вважається альтернатива «${b.alternativeName}» ` +
            `з інтегральним балом ${b.score}. Найбільший внесок у цей результат дають критерії: ${namesTop.join(' та ')} ` +
            `(частка в зваженій сумі нормалізованих оцінок — у полі shareOfWeightedSumPercent). ` +
            `Нормалізація мінімаксом усуває різницю одиниць виміру між критеріями.`;
        return {
            summary,
            strategyNote: 'Порівняйте відповідь з strategy=equal_minmax та strategy=weighted_minmax, щоб побачити вплив експертних ваг.',
            contributions,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alternatives_service_1.AlternativesService,
        criteria_service_1.CriteriaService,
        evaluations_service_1.EvaluationsService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map