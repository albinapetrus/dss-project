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
exports.ImportService = void 0;
const common_1 = require("@nestjs/common");
const alternatives_service_1 = require("../alternatives/alternatives.service");
const criteria_service_1 = require("../criteria/criteria.service");
const evaluations_service_1 = require("../evaluations/evaluations.service");
const import_dto_1 = require("./dto/import.dto");
function normKey(s) {
    return s.trim().toLowerCase();
}
function algebraicMean(values) {
    return values.reduce((a, b) => a + b, 0) / values.length;
}
function geometricMean(values) {
    const pos = values.filter((v) => v > 0);
    if (pos.length !== values.length) {
        throw new common_1.BadRequestException('Геометричне середнє потребує додатних оцінок.');
    }
    return Math.exp(pos.reduce((s, v) => s + Math.log(v), 0) / pos.length);
}
function medianSorted(sorted) {
    const n = sorted.length;
    if (n === 0)
        return 0;
    const mid = Math.floor(n / 2);
    return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function median(values) {
    const s = [...values].sort((a, b) => a - b);
    return medianSorted(s);
}
let ImportService = class ImportService {
    constructor(alternatives, criteria, evaluations) {
        this.alternatives = alternatives;
        this.criteria = criteria;
        this.evaluations = evaluations;
    }
    async importExpertEvaluations(dto) {
        const [alts, crits] = await Promise.all([this.alternatives.findAll(), this.criteria.findAll()]);
        const altByName = new Map(alts.map((a) => [normKey(a.name), a]));
        const critByName = new Map(crits.map((c) => [normKey(c.name), c]));
        const unresolved = [];
        const pairs = new Map();
        for (const row of dto.rows) {
            const a = altByName.get(normKey(row.alternativeKey));
            const c = critByName.get(normKey(row.criterionKey));
            if (!a || !c) {
                unresolved.push(`${row.alternativeKey} / ${row.criterionKey}`);
                continue;
            }
            const key = `${a._id.toString()}:${c._id.toString()}`;
            if (!pairs.has(key))
                pairs.set(key, []);
            pairs.get(key).push(row.value);
        }
        if (unresolved.length) {
            throw new common_1.BadRequestException({
                message: 'Невідомі назви альтернатив або критеріїв.',
                unresolved: [...new Set(unresolved)].slice(0, 50),
            });
        }
        const aggregated = new Map();
        for (const [key, vals] of pairs) {
            let v;
            if (dto.method === import_dto_1.ExpertConsensusMethod.ALGEBRAIC_MEAN)
                v = algebraicMean(vals);
            else if (dto.method === import_dto_1.ExpertConsensusMethod.MEDIAN)
                v = median(vals);
            else
                v = geometricMean(vals);
            aggregated.set(key, Number(v.toFixed(8)));
        }
        let upserted = 0;
        for (const [key, value] of aggregated) {
            const [aid, cid] = key.split(':');
            await this.evaluations.upsertPair(aid, cid, value);
            upserted += 1;
        }
        return {
            method: dto.method,
            pairsUpdated: upserted,
            expertRowsProcessed: dto.rows.length,
        };
    }
    async importCriterionVotes(dto) {
        const crits = await this.criteria.findAll();
        const critByName = new Map(crits.map((c) => [normKey(c.name), c]));
        const byCrit = new Map();
        const experts = new Set();
        for (const row of dto.rows) {
            const c = critByName.get(normKey(row.criterionKey));
            if (!c) {
                throw new common_1.BadRequestException(`Невідомий критерій: ${row.criterionKey}`);
            }
            const id = c._id.toString();
            experts.add(row.expertKey);
            if (!byCrit.has(id))
                byCrit.set(id, []);
            byCrit.get(id).push(row.rankPosition);
        }
        const critIds = [...byCrit.keys()];
        if (critIds.length === 0) {
            throw new common_1.BadRequestException('Немає даних для голосування.');
        }
        const nCrit = critIds.length;
        const scores = {};
        for (const cid of critIds) {
            const ranks = byCrit.get(cid);
            if (dto.method === import_dto_1.CriterionVotingMethod.MEAN_RANK) {
                const avg = algebraicMean(ranks);
                scores[cid] = 1 / avg;
            }
            else if (dto.method === import_dto_1.CriterionVotingMethod.BORDA) {
                scores[cid] = ranks.reduce((s, r) => s + (nCrit - r), 0);
            }
            else if (dto.method === import_dto_1.CriterionVotingMethod.MEDIAN_RANK) {
                const med = median(ranks);
                scores[cid] = 1 / med;
            }
            else {
                scores[cid] = ranks.reduce((s, r) => s + 1 / r, 0);
            }
        }
        const sum = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
        const targetScale = nCrit;
        let updated = 0;
        for (const cid of critIds) {
            const w = (scores[cid] / sum) * targetScale;
            const weight = Math.max(0.0001, Number(w.toFixed(6)));
            await this.criteria.update(cid, { weight });
            updated += 1;
        }
        return {
            method: dto.method,
            criteriaUpdated: updated,
            expertCount: experts.size,
            rows: dto.rows.length,
        };
    }
};
exports.ImportService = ImportService;
exports.ImportService = ImportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alternatives_service_1.AlternativesService,
        criteria_service_1.CriteriaService,
        evaluations_service_1.EvaluationsService])
], ImportService);
//# sourceMappingURL=import.service.js.map