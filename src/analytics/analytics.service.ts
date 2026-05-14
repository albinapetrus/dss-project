import { Injectable, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import { AlternativesService } from '../alternatives/alternatives.service';
import { CriteriaService } from '../criteria/criteria.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { RulesService } from '../rules/rules.service';
import { ScenariosService } from '../scenarios/scenarios.service';
import { CriterionType } from '../criteria/criterion.schema';
import { RuleAction, RuleOperator } from '../rules/expert-rule.schema';

export type FoldMethod = 'additive' | 'cautious_min' | 'multiplicative';
export type WeightMode = 'weighted' | 'equal';
export type LegacyRankingStrategy = 'weighted_minmax' | 'equal_minmax';

type PopulatedRef = { _id: { toString(): string }; name: string; description?: string; type?: CriterionType };

type CritMeta = {
  id: string;
  name: string;
  type: CriterionType;
  weight: number;
  scaleMin?: number;
  scaleMax?: number;
  thresholdMin?: number;
  thresholdMax?: number;
};

type ScoredRow = {
  alternativeId: string;
  alternativeName: string;
  score: number;
  normalizedByCriterion: Record<string, { raw: number; normalized: number }>;
};

function refId(ref: string | PopulatedRef): string {
  if (typeof ref === 'string') return ref;
  return ref._id.toString();
}

function evalOp(raw: number, op: RuleOperator, tv: number): boolean {
  switch (op) {
    case RuleOperator.GT:
      return raw > tv;
    case RuleOperator.GTE:
      return raw >= tv;
    case RuleOperator.LT:
      return raw < tv;
    case RuleOperator.LTE:
      return raw <= tv;
    case RuleOperator.EQ:
      return raw === tv;
    default:
      return false;
  }
}

function applyScale(raw: number, scaleMin?: number, scaleMax?: number): number {
  if (scaleMin === undefined || scaleMax === undefined) return raw;
  if (scaleMax <= scaleMin) return raw;
  const t = (raw - scaleMin) / (scaleMax - scaleMin);
  return Math.max(0, Math.min(1, t));
}

function effectiveW(c: CritMeta, weightMode: WeightMode, scenarioW?: number): number {
  const base = scenarioW !== undefined ? scenarioW : c.weight;
  if (weightMode === 'equal') return 1;
  return base > 0 ? base : 1;
}

function effectiveThreshold(
  c: CritMeta,
  scen?: { min?: number; max?: number },
): { min?: number; max?: number } {
  const min = scen?.min !== undefined ? scen.min : c.thresholdMin;
  const max = scen?.max !== undefined ? scen.max : c.thresholdMax;
  return { min, max };
}

function failsThreshold(raw: number, min?: number, max?: number): boolean {
  if (min !== undefined && raw < min) return true;
  if (max !== undefined && raw > max) return true;
  return false;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly alternatives: AlternativesService,
    private readonly criteria: CriteriaService,
    private readonly evaluations: EvaluationsService,
    private readonly rules: RulesService,
    private readonly scenarios: ScenariosService,
  ) {}

  async getEvaluationMatrix() {
    const [alts, crits, evals] = await Promise.all([
      this.alternatives.findAll(),
      this.criteria.findAll(),
      this.evaluations.findAll(),
    ]);

    const valueByPair = new Map<string, number>();
    for (const e of evals) {
      const aid = refId(e.alternativeId as string | PopulatedRef);
      const cid = refId(e.criterionId as string | PopulatedRef);
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
          value: valueByPair.has(key) ? valueByPair.get(key)! : null,
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

  async calculateRankings(
    fold: FoldMethod = 'additive',
    weightMode: WeightMode = 'weighted',
    scenarioId?: string,
  ) {
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

    const critMeta = new Map<string, CritMeta>(
      criteria.map((c) => [
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
      ]),
    );

    const critList = criteria.map((c) => c.id);
    const valueByPair = new Map<string, number>();

    for (const row of rows) {
      for (const cell of row.cells) {
        const key = `${row.alternativeId}:${cell.criterionId}`;
        const scenVal = scenSnap?.evaluationOverrides[key];
        const v = scenVal !== undefined ? scenVal : cell.value;
        if (v !== null && v !== undefined) valueByPair.set(key, v);
      }
    }

    const missing: { alternativeId: string; alternativeName: string; missingCriterionIds: string[] }[] = [];

    for (const row of rows) {
      const miss: string[] = [];
      for (const cid of critList) {
        const key = `${row.alternativeId}:${cid}`;
        if (!valueByPair.has(key)) miss.push(cid);
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
      throw new UnprocessableEntityException({
        message: 'Матриця оцінювання неповна: для ранжування потрібні всі пари (альтернатива, критерій).',
        incomplete: missing,
        matrix,
      });
    }

    const thresholdExcluded: { alternativeId: string; alternativeName: string; reason: string }[] = [];
    const ruleExcluded: { alternativeId: string; alternativeName: string; ruleName: string }[] = [];

    const excludedIds = new Set<string>();

    for (const row of rows) {
      const aid = row.alternativeId;
      for (const cid of critList) {
        const raw = valueByPair.get(`${aid}:${cid}`)!;
        const c = critMeta.get(cid)!;
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
      if (rule.action !== RuleAction.EXCLUDE) continue;
      const cid = rule.criterionId.toString();
      for (const row of rows) {
        if (excludedIds.has(row.alternativeId)) continue;
        const raw = valueByPair.get(`${row.alternativeId}:${cid}`);
        if (raw === undefined) continue;
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
      throw new BadRequestException({
        message: 'Усі альтернативи відсічені порогами або правилами фільтрації.',
        thresholdExcluded,
        ruleExcluded,
        matrix,
      });
    }

    const colScaled = new Map<string, number[]>();
    for (const cid of critList) {
      const c = critMeta.get(cid)!;
      const vals = feasibleRows.map((r) => applyScale(valueByPair.get(`${r.alternativeId}:${cid}`)!, c.scaleMin, c.scaleMax));
      colScaled.set(cid, vals );
    }

    const normalizedRows: ScoredRow[] = feasibleRows.map((row) => {
      const normalizedByCriterion: Record<string, { raw: number; normalized: number }> = {};
      for (const cid of critList) {
        const c = critMeta.get(cid)!;
        const raw = valueByPair.get(`${row.alternativeId}:${cid}`)!;
        const scaled = applyScale(raw, c.scaleMin, c.scaleMax);
        const vals = colScaled.get(cid) ?? [];
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        let n = 1;
        if (max > min) {
          n =
            c.type === CriterionType.MINIMIZE
              ? (max - scaled) / (max - min)
              : (scaled - min) / (max - min);
        }
        normalizedByCriterion[cid] = { raw, normalized: Number(n.toFixed(6)) };
      }

      const wScenario = (id: string) => scenSnap?.weightOverrides[id];
      let score = 0;

      if (fold === 'additive') {
        let num = 0;
        let den = 0;
        for (const cid of critList) {
          const c = critMeta.get(cid)!;
          const w = effectiveW(c, weightMode, wScenario(cid));
          const n = normalizedByCriterion[cid].normalized;
          num += w * n;
          den += w;
        }
        score = den > 0 ? num / den : 0;
      } else if (fold === 'cautious_min') {
        const parts = critList.map((cid) => {
          const c = critMeta.get(cid)!;
          const w = effectiveW(c, weightMode, wScenario(cid));
          const n = normalizedByCriterion[cid].normalized;
          return n * w;
        });
        score = Math.min(...parts);
      } else {
        let sumW = 0;
        let logSum = 0;
        const eps = 1e-9;
        for (const cid of critList) {
          const c = critMeta.get(cid)!;
          const w = effectiveW(c, weightMode, wScenario(cid));
          const n = Math.max(normalizedByCriterion[cid].normalized, eps);
          sumW += w;
          logSum += w * Math.log(n);
        }
        score = sumW > 0 ? Math.exp(logSum / sumW) : 0;
      }

      score = Number(score.toFixed(6));

      for (const rule of rulesEnabled) {
        if (rule.action !== RuleAction.PENALTY || rule.penaltyPercent === undefined) continue;
        const cid = rule.criterionId.toString();
        const raw = normalizedByCriterion[cid].raw;
        if (!evalOp(raw, rule.operator, rule.thresholdValue)) continue;
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
      .filter(
        (r) =>
          r.action === RuleAction.PENALTY &&
          best &&
          evalOp(best.normalizedByCriterion[r.criterionId.toString()].raw, r.operator, r.thresholdValue),
      )
      .map((r) => r.name);

    const explanation = this.buildExplanationUk(
      best,
      criteria,
      fold,
      weightMode,
      scenSnap,
      penaltyRulesApplied,
      thresholdExcluded,
      ruleExcluded,
    );

    return {
      fold,
      weightMode,
      scenarioId: scenarioId ?? null,
      method: methodUk,
      howToRead:
        'Після порогів і правил виключення нормалізація лише серед допустимих альтернатив. Правила штрафу зменшують інтегральний бал за умови IF.',
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

  async rankingsCompare(weightMode: WeightMode = 'weighted', scenarioId?: string) {
    const folds: FoldMethod[] = ['additive', 'cautious_min', 'multiplicative'];
    const out: Record<string, unknown> = {};
    for (const f of folds) {
      out[f] = await this.calculateRankings(f, weightMode, scenarioId);
    }
    return { weightMode, scenarioId: scenarioId ?? null, byFold: out };
  }

  async sensitivity(
    criterionId: string,
    fromW: number,
    toW: number,
    steps: number,
    fold: FoldMethod,
    weightMode: WeightMode,
  ) {
    if (steps < 2 || fromW <= 0 || toW <= 0) {
      throw new BadRequestException('steps ≥ 2, ваги мають бути додатними.');
    }
    await this.criteria.findOne(criterionId);
    const points: {
      weight: number;
      bestAlternativeId: string | null;
      bestAlternativeName: string | null;
      rankings: { rank: number; alternativeId: string; alternativeName: string; score: number }[];
    }[] = [];

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
      } finally {
        await this.scenarios.remove(scenarioId);
      }
    }

    return { criterionId, fold, weightMode, points };
  }

  private async createTempScenarioWeight(criterionId: string, weight: number): Promise<string> {
    const s = await this.scenarios.create({
      name: `_tmp_sensitivity_${Date.now()}`,
      weightOverrides: { [criterionId]: weight },
    });
    return (s as { _id: { toString(): string } })._id.toString();
  }

  async stability(fold: FoldMethod, weightMode: WeightMode, samples = 25, relativeNoise = 0.08) {
    const crits = await this.criteria.findAll();
    const alts = await this.alternatives.findAll();
    if (crits.length === 0 || alts.length === 0) {
      return { message: 'Недостатньо даних.', winners: {}, samples: 0 };
    }
    const counts = new Map<string, number>();
    for (let s = 0; s < samples; s++) {
      const overrides: Record<string, number> = {};
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
        const res = await this.calculateRankings(fold, weightMode, (scen as { _id: { toString(): string } })._id.toString());
        const top = res.rankings[0];
        if (top) {
          counts.set(top.alternativeId, (counts.get(top.alternativeId) ?? 0) + 1);
        }
      } finally {
        await this.scenarios.remove((scen as { _id: { toString(): string } })._id.toString());
      }
    }
    const winners: Record<string, number> = {};
    for (const [k, v] of counts) winners[k] = v;
    return {
      fold,
      weightMode,
      samples,
      relativeNoise,
      /** Частка випадків, коли альтернатива була #1 після шуму ваг */
      winners,
      stabilityNote:
        'Чим більша частка для лідера — тим стабільніше рішення до невеликих змін ваг (УМОВНО, з урахуванням випадкового шуму).',
    };
  }

  /** Mапінг legacy query strategy → fold + weightMode */
  resolveLegacyStrategy(s: LegacyRankingStrategy): { fold: FoldMethod; weightMode: WeightMode } {
    if (s === 'equal_minmax') return { fold: 'additive', weightMode: 'equal' };
    return { fold: 'additive', weightMode: 'weighted' };
  }

  private foldLabelUk(fold: FoldMethod): string {
    if (fold === 'additive') return 'адитивна (зважене середнє нормалізованих)';
    if (fold === 'cautious_min') return 'обережна (мінімум зважених нормалізованих значень)';
    return 'мультиплікативна (зважене геометричне середнє нормалізованих)';
  }

  private emptyRankings(fold: FoldMethod, weightMode: WeightMode, matrix: unknown, message: string) {
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

  private buildExplanationUk(
    best: ScoredRow | undefined,
    criteria: { id: string; name: string; weight?: number }[],
    fold: FoldMethod,
    weightMode: WeightMode,
    scenSnap: { weightOverrides: Record<string, number> } | null,
    penaltyRulesApplied: string[],
    thresholdExcluded: { alternativeId: string; alternativeName: string; reason: string }[],
    ruleExcluded: { alternativeId: string; alternativeName: string; ruleName: string }[],
  ) {
    const b = best;
    if (!b) return null;

    const parts = criteria.map((c) => {
      const wBase = c.weight ?? 1;
      const wUsed =
        weightMode === 'equal' ? 1 : scenSnap?.weightOverrides[c.id] !== undefined ? scenSnap.weightOverrides[c.id]! : wBase;
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

    const sumProducts =
      fold === 'multiplicative'
        ? parts.reduce((s, p) => s + p.product, 0) || 1
        : parts.reduce((s, p) => s + (p.weightUsed * p.normalized), 0) || 1;

    const contributions = parts.map((p) => ({
      criterionId: p.criterionId,
      criterionName: p.criterionName,
      weightUsed: p.weightUsed,
      rawValue: p.rawValue,
      normalized: p.normalized,
      shareOfWeightedSumPercent: Number(
        ((100 * (fold === 'multiplicative' ? p.product : p.weightUsed * p.normalized)) / sumProducts).toFixed(2),
      ),
    }));

    const topDrivers = [...contributions].sort((a, b) => b.shareOfWeightedSumPercent - a.shareOfWeightedSumPercent);
    const namesTop = topDrivers.slice(0, 2).map((x) => `«${x.criterionName}»`);

    let summary =
      `Найкраща серед допустимих альтернатив — «${b.alternativeName}» з балом ${b.score} ` +
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
}
