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
const rules_service_1 = require("../rules/rules.service");
const scenarios_service_1 = require("../scenarios/scenarios.service");
const criterion_schema_1 = require("../criteria/criterion.schema");
const expert_rule_schema_1 = require("../rules/expert-rule.schema");
function refId(ref) {
    if (typeof ref === 'string')
        return ref;
    return ref._id.toString();
}
function evalOp(raw, op, tv) {
    switch (op) {
        case expert_rule_schema_1.RuleOperator.GT:
            return raw > tv;
        case expert_rule_schema_1.RuleOperator.GTE:
            return raw >= tv;
        case expert_rule_schema_1.RuleOperator.LT:
            return raw < tv;
        case expert_rule_schema_1.RuleOperator.LTE:
            return raw <= tv;
        case expert_rule_schema_1.RuleOperator.EQ:
            return raw === tv;
        default:
            return false;
    }
}
function applyScale(raw, scaleMin, scaleMax) {
    if (scaleMin === undefined || scaleMax === undefined)
        return raw;
    if (scaleMax <= scaleMin)
        return raw;
    const t = (raw - scaleMin) / (scaleMax - scaleMin);
    return Math.max(0, Math.min(1, t));
}
function effectiveW(c, weightMode, scenarioW) {
    const base = scenarioW !== undefined ? scenarioW : c.weight;
    if (weightMode === 'equal')
        return 1;
    return base > 0 ? base : 1;
}
function effectiveThreshold(c, scen) {
    const min = scen?.min !== undefined ? scen.min : c.thresholdMin;
    const max = scen?.max !== undefined ? scen.max : c.thresholdMax;
    return { min, max };
}
function failsThreshold(raw, min, max) {
    if (min !== undefined && raw < min)
        return true;
    if (max !== undefined && raw > max)
        return true;
    return false;
}
let AnalyticsService = class AnalyticsService {
    constructor(alternatives, criteria, evaluations, rules, scenarios) {
        this.alternatives = alternatives;
        this.criteria = criteria;
        this.evaluations = evaluations;
        this.rules = rules;
        this.scenarios = scenarios;
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
                scaleMin: c.scaleMin,
                scaleMax: c.scaleMax,
                thresholdMin: c.thresholdMin,
                thresholdMax: c.thresholdMax,
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
    async calculateRankings(fold = 'additive', weightMode = 'weighted', scenarioId) {
        const scenario = scenarioId ? await this.scenarios.findOne(scenarioId) : null;
        const scenSnap = scenario
            ? {
                weightOverrides: scenario.weightOverrides ?? {},
                evaluationOverrides: scenario.evaluationOverrides ?? {},
                thresholdOverrides: scenario.thresholdOverrides ?? {},
            }
            : null;
        const matrix = await this.getEvaluationMatrix();
        const rulesEnabled = await this.rules.findEnabled();
        const { alternatives, criteria, rows } = matrix;
        if (alternatives.length === 0 || criteria.length === 0) {
            return this.emptyRankings(fold, weightMode, matrix, 'Немає альтернатив або критеріїв для ранжування.');
        }
        const critMeta = new Map(criteria.map((c) => [
            c.id,
            {
                id: c.id,
                name: c.name,
                type: c.type,
                weight: c.weight ?? 1,
                scaleMin: c.scaleMin,
                scaleMax: c.scaleMax,
                thresholdMin: c.thresholdMin,
                thresholdMax: c.thresholdMax,
            },
        ]));
        const critList = criteria.map((c) => c.id);
        const valueByPair = new Map();
        for (const row of rows) {
            for (const cell of row.cells) {
                const key = `${row.alternativeId}:${cell.criterionId}`;
                const scenVal = scenSnap?.evaluationOverrides[key];
                const v = scenVal !== undefined ? scenVal : cell.value;
                if (v !== null && v !== undefined)
                    valueByPair.set(key, v);
            }
        }
        const missing = [];
        for (const row of rows) {
            const miss = [];
            for (const cid of critList) {
                const key = `${row.alternativeId}:${cid}`;
                if (!valueByPair.has(key))
                    miss.push(cid);
            }
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
        const thresholdExcluded = [];
        const ruleExcluded = [];
        const excludedIds = new Set();
        for (const row of rows) {
            const aid = row.alternativeId;
            for (const cid of critList) {
                const raw = valueByPair.get(`${aid}:${cid}`);
                const c = critMeta.get(cid);
                const th = effectiveThreshold(c, scenSnap?.thresholdOverrides[cid]);
                if (failsThreshold(raw, th.min, th.max)) {
                    thresholdExcluded.push({
                        alternativeId: aid,
                        alternativeName: row.alternativeName,
                        reason: `Критерій «${c.name}»: значення ${raw} поза допустимим діапазоном [${th.min ?? '−∞'}; ${th.max ?? '+∞'}]`,
                    });
                    excludedIds.add(aid);
                    break;
                }
            }
        }
        for (const rule of rulesEnabled) {
            if (rule.action !== expert_rule_schema_1.RuleAction.EXCLUDE)
                continue;
            const cid = rule.criterionId.toString();
            for (const row of rows) {
                if (excludedIds.has(row.alternativeId))
                    continue;
                const raw = valueByPair.get(`${row.alternativeId}:${cid}`);
                if (raw === undefined)
                    continue;
                if (evalOp(raw, rule.operator, rule.thresholdValue)) {
                    ruleExcluded.push({
                        alternativeId: row.alternativeId,
                        alternativeName: row.alternativeName,
                        ruleName: rule.name,
                    });
                    excludedIds.add(row.alternativeId);
                }
            }
        }
        const feasibleRows = rows.filter((r) => !excludedIds.has(r.alternativeId));
        if (feasibleRows.length === 0) {
            throw new common_1.BadRequestException({
                message: 'Усі альтернативи відсічені порогами або правилами фільтрації.',
                thresholdExcluded,
                ruleExcluded,
                matrix,
            });
        }
        const colScaled = new Map();
        for (const cid of critList) {
            const c = critMeta.get(cid);
            const vals = feasibleRows.map((r) => applyScale(valueByPair.get(`${r.alternativeId}:${cid}`), c.scaleMin, c.scaleMax));
            colScaled.set(cid, vals);
        }
        const normalizedRows = feasibleRows.map((row) => {
            const normalizedByCriterion = {};
            for (const cid of critList) {
                const c = critMeta.get(cid);
                const raw = valueByPair.get(`${row.alternativeId}:${cid}`);
                const scaled = applyScale(raw, c.scaleMin, c.scaleMax);
                const vals = colScaled.get(cid) ?? [];
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                let n = 1;
                if (max > min) {
                    n =
                        c.type === criterion_schema_1.CriterionType.MINIMIZE
                            ? (max - scaled) / (max - min)
                            : (scaled - min) / (max - min);
                }
                normalizedByCriterion[cid] = { raw, normalized: Number(n.toFixed(6)) };
            }
            const wScenario = (id) => scenSnap?.weightOverrides[id];
            let score = 0;
            if (fold === 'additive') {
                let num = 0;
                let den = 0;
                for (const cid of critList) {
                    const c = critMeta.get(cid);
                    const w = effectiveW(c, weightMode, wScenario(cid));
                    const n = normalizedByCriterion[cid].normalized;
                    num += w * n;
                    den += w;
                }
                score = den > 0 ? num / den : 0;
            }
            else if (fold === 'cautious_min') {
                const parts = critList.map((cid) => {
                    const c = critMeta.get(cid);
                    const w = effectiveW(c, weightMode, wScenario(cid));
                    const n = normalizedByCriterion[cid].normalized;
                    return n * w;
                });
                score = Math.min(...parts);
            }
            else {
                let sumW = 0;
                let logSum = 0;
                const eps = 1e-9;
                for (const cid of critList) {
                    const c = critMeta.get(cid);
                    const w = effectiveW(c, weightMode, wScenario(cid));
                    const n = Math.max(normalizedByCriterion[cid].normalized, eps);
                    sumW += w;
                    logSum += w * Math.log(n);
                }
                score = sumW > 0 ? Math.exp(logSum / sumW) : 0;
            }
            score = Number(score.toFixed(6));
            for (const rule of rulesEnabled) {
                if (rule.action !== expert_rule_schema_1.RuleAction.PENALTY || rule.penaltyPercent === undefined)
                    continue;
                const cid = rule.criterionId.toString();
                const raw = normalizedByCriterion[cid].raw;
                if (!evalOp(raw, rule.operator, rule.thresholdValue))
                    continue;
                const k = 1 - rule.penaltyPercent / 100;
                score = Number((score * Math.max(0, k)).toFixed(6));
            }
            return {
                alternativeId: row.alternativeId,
                alternativeName: row.alternativeName,
                score,
                normalizedByCriterion,
            };
        });
        const sorted = [...normalizedRows].sort((a, b) => b.score - a.score);
        const best = sorted[0];
        const rankings = sorted.map((r, i) => ({
            rank: i + 1,
            alternativeId: r.alternativeId,
            alternativeName: r.alternativeName,
            score: r.score,
        }));
        const foldLabel = this.foldLabelUk(fold);
        const weightLabel = weightMode === 'weighted' ? 'зважені ваги' : 'рівні ваги';
        const methodUk = `Нормалізація мінімакс по стовпцях серед допустимих альтернатив; шкала критерію — за полями scaleMin/scaleMax, якщо задані. Згортка: ${foldLabel}; ${weightLabel}.`;
        const penaltyRulesApplied = rulesEnabled
            .filter((r) => r.action === expert_rule_schema_1.RuleAction.PENALTY &&
            best &&
            evalOp(best.normalizedByCriterion[r.criterionId.toString()].raw, r.operator, r.thresholdValue))
            .map((r) => r.name);
        const explanation = this.buildExplanationUk(best, criteria, fold, weightMode, scenSnap, penaltyRulesApplied, thresholdExcluded, ruleExcluded);
        return {
            fold,
            weightMode,
            scenarioId: scenarioId ?? null,
            method: methodUk,
            howToRead: 'Після порогів і правил виключення нормалізація лише серед допустимих альтернатив. Правила штрафу зменшують інтегральний бал за умови IF.',
            rankings,
            bestAlternative: best
                ? { rank: 1, alternativeId: best.alternativeId, alternativeName: best.alternativeName, score: best.score }
                : null,
            explanation,
            thresholdExcluded,
            ruleExcluded,
            appliedPenaltyRuleNames: penaltyRulesApplied,
            detail: sorted.map((r) => ({
                alternativeId: r.alternativeId,
                alternativeName: r.alternativeName,
                score: r.score,
                normalizedByCriterion: r.normalizedByCriterion,
            })),
            matrix,
        };
    }
    async rankingsCompare(weightMode = 'weighted', scenarioId) {
        const folds = ['additive', 'cautious_min', 'multiplicative'];
        const out = {};
        for (const f of folds) {
            out[f] = await this.calculateRankings(f, weightMode, scenarioId);
        }
        return { weightMode, scenarioId: scenarioId ?? null, byFold: out };
    }
    async sensitivity(criterionId, fromW, toW, steps, fold, weightMode) {
        if (steps < 2 || fromW <= 0 || toW <= 0) {
            throw new common_1.BadRequestException('steps ≥ 2, ваги мають бути додатними.');
        }
        await this.criteria.findOne(criterionId);
        const points = [];
        for (let i = 0; i < steps; i++) {
            const t = steps === 1 ? 0 : i / (steps - 1);
            const w = fromW + t * (toW - fromW);
            const scenarioId = await this.createTempScenarioWeight(criterionId, w);
            try {
                const res = await this.calculateRankings(fold, weightMode, scenarioId);
                const top = res.rankings[0];
                points.push({
                    weight: Number(w.toFixed(6)),
                    bestAlternativeId: top?.alternativeId ?? null,
                    bestAlternativeName: top?.alternativeName ?? null,
                    rankings: res.rankings,
                });
            }
            finally {
                await this.scenarios.remove(scenarioId);
            }
        }
        return { criterionId, fold, weightMode, points };
    }
    async createTempScenarioWeight(criterionId, weight) {
        const s = await this.scenarios.create({
            name: `_tmp_sensitivity_${Date.now()}`,
            weightOverrides: { [criterionId]: weight },
        });
        return s._id.toString();
    }
    async stability(fold, weightMode, samples = 25, relativeNoise = 0.08) {
        const crits = await this.criteria.findAll();
        const alts = await this.alternatives.findAll();
        if (crits.length === 0 || alts.length === 0) {
            return { message: 'Недостатньо даних.', winners: {}, samples: 0 };
        }
        const counts = new Map();
        for (let s = 0; s < samples; s++) {
            const overrides = {};
            for (const c of crits) {
                const w0 = c.weight ?? 1;
                const noise = 1 + (Math.random() * 2 - 1) * relativeNoise;
                overrides[c._id.toString()] = Math.max(0.0001, w0 * noise);
            }
            const scen = await this.scenarios.create({
                name: `_tmp_stab_${Date.now()}_${s}`,
                weightOverrides: overrides,
            });
            try {
                const res = await this.calculateRankings(fold, weightMode, scen._id.toString());
                const top = res.rankings[0];
                if (top) {
                    counts.set(top.alternativeId, (counts.get(top.alternativeId) ?? 0) + 1);
                }
            }
            finally {
                await this.scenarios.remove(scen._id.toString());
            }
        }
        const winners = {};
        for (const [k, v] of counts)
            winners[k] = v;
        return {
            fold,
            weightMode,
            samples,
            relativeNoise,
            winners,
            stabilityNote: 'Чим більша частка для лідера — тим стабільніше рішення до невеликих змін ваг (УМОВНО, з урахуванням випадкового шуму).',
        };
    }
    resolveLegacyStrategy(s) {
        if (s === 'equal_minmax')
            return { fold: 'additive', weightMode: 'equal' };
        return { fold: 'additive', weightMode: 'weighted' };
    }
    foldLabelUk(fold) {
        if (fold === 'additive')
            return 'адитивна (зважене середнє нормалізованих)';
        if (fold === 'cautious_min')
            return 'обережна (мінімум зважених нормалізованих значень)';
        return 'мультиплікативна (зважене геометричне середнє нормалізованих)';
    }
    emptyRankings(fold, weightMode, matrix, message) {
        return {
            fold,
            weightMode,
            scenarioId: null,
            method: this.foldLabelUk(fold),
            message,
            rankings: [],
            bestAlternative: null,
            explanation: null,
            thresholdExcluded: [],
            ruleExcluded: [],
            matrix,
        };
    }
    buildExplanationUk(best, criteria, fold, weightMode, scenSnap, penaltyRulesApplied, thresholdExcluded, ruleExcluded) {
        const b = best;
        if (!b)
            return null;
        const parts = criteria.map((c) => {
            const wBase = c.weight ?? 1;
            const wUsed = weightMode === 'equal' ? 1 : scenSnap?.weightOverrides[c.id] !== undefined ? scenSnap.weightOverrides[c.id] : wBase;
            const cell = b.normalizedByCriterion[c.id];
            const n = cell.normalized;
            return {
                criterionId: c.id,
                criterionName: c.name,
                weightUsed: wUsed,
                rawValue: cell.raw,
                normalized: n,
                product: fold === 'multiplicative' ? Math.log(Math.max(n, 1e-9)) * wUsed : wUsed * n,
            };
        });
        const sumProducts = fold === 'multiplicative'
            ? parts.reduce((s, p) => s + p.product, 0) || 1
            : parts.reduce((s, p) => s + (p.weightUsed * p.normalized), 0) || 1;
        const contributions = parts.map((p) => ({
            criterionId: p.criterionId,
            criterionName: p.criterionName,
            weightUsed: p.weightUsed,
            rawValue: p.rawValue,
            normalized: p.normalized,
            shareOfWeightedSumPercent: Number(((100 * (fold === 'multiplicative' ? p.product : p.weightUsed * p.normalized)) / sumProducts).toFixed(2)),
        }));
        const topDrivers = [...contributions].sort((a, b) => b.shareOfWeightedSumPercent - a.shareOfWeightedSumPercent);
        const namesTop = topDrivers.slice(0, 2).map((x) => `«${x.criterionName}»`);
        let summary = `Найкраща серед допустимих альтернатив — «${b.alternativeName}» з балом ${b.score} ` +
            `(${this.foldLabelUk(fold)}, ${weightMode === 'weighted' ? 'зважені ваги' : 'рівні ваги'}). ` +
            `Найбільший відносний внесок: ${namesTop.join(', ')}.`;
        if (thresholdExcluded.length) {
            summary += ` Відсічено порогами: ${thresholdExcluded.length} запис(ів).`;
        }
        if (ruleExcluded.length) {
            summary += ` Виключено правилами IF: ${ruleExcluded.map((r) => r.alternativeName).join(', ')}.`;
        }
        if (penaltyRulesApplied.length) {
            summary += ` Застосовано штрафні правила: ${penaltyRulesApplied.join(', ')}.`;
        }
        return {
            summary,
            strategyNote: 'Порівняйте fold=additive | cautious_min | multiplicative для одних даних.',
            contributions,
            thresholdExcluded,
            ruleExcluded,
            appliedPenaltyRuleNames: penaltyRulesApplied,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alternatives_service_1.AlternativesService,
        criteria_service_1.CriteriaService,
        evaluations_service_1.EvaluationsService,
        rules_service_1.RulesService,
        scenarios_service_1.ScenariosService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map