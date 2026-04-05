import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { AlternativesService } from '../alternatives/alternatives.service';
import { CriteriaService } from '../criteria/criteria.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { CriterionType } from '../criteria/criterion.schema';

export type RankingStrategy = 'weighted_minmax' | 'equal_minmax';

type ScoredAlternativeRow = {
  alternativeId: string;
  alternativeName: string;
  score: number;
  normalizedByCriterion: Record<string, { raw: number; normalized: number }>;
};

type PopulatedRef = { _id: { toString(): string }; name: string; description?: string; type?: CriterionType };

function refId(ref: string | PopulatedRef): string {
  if (typeof ref === 'string') return ref;
  return ref._id.toString();
}

function criterionWeight(raw: number | undefined, strategy: RankingStrategy): number {
  if (strategy === 'equal_minmax') return 1;
  const w = raw ?? 1;
  return w > 0 ? w : 1;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly alternatives: AlternativesService,
    private readonly criteria: CriteriaService,
    private readonly evaluations: EvaluationsService,
  ) {}

  /**
   * Повертає сирі значення матриці «альтернатива × критерій» та метадані.
   */
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

  /**
   * Ранжування: мінімакс-нормалізація по стовпцях; згортка — зважена або рівноважна (див. strategy).
   */
  async calculateRankings(strategy: RankingStrategy = 'weighted_minmax') {
    const matrix = await this.getEvaluationMatrix();
    const { alternatives, criteria, rows } = matrix;

    if (alternatives.length === 0 || criteria.length === 0) {
      return {
        strategy,
        method:
          'Мінімакс-нормалізація значень по кожному критерію; інтегральний бал = Σ(wᵢ·ñᵢ) / Σ(wᵢ), де ñᵢ ∈ [0,1].',
        message: 'Немає альтернатив або критеріїв для ранжування.',
        rankings: [],
        bestAlternative: null,
        explanation: null,
        matrix,
      };
    }

    const missing: { alternativeId: string; alternativeName: string; missingCriterionIds: string[] }[] = [];

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
      throw new UnprocessableEntityException({
        message: 'Матриця оцінювання неповна: для ранжування потрібні всі пари (альтернатива, критерій).',
        incomplete: missing,
        matrix,
      });
    }

    const critList = criteria.map((c) => c.id);
    const colValues = new Map<string, number[]>();
    for (const cid of critList) {
      colValues.set(
        cid,
        rows.map((r) => r.cells.find((x) => x.criterionId === cid).value as number),
      );
    }

    const critMeta = new Map(criteria.map((c) => [c.id, c] as const));

    const normalizedRows = rows.map((row) => {
      const normalizedByCriterion: Record<string, { raw: number; normalized: number }> = {};
      for (const cell of row.cells) {
        const cid = cell.criterionId;
        const vals = colValues.get(cid) ?? [];
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const v = cell.value as number;
        const type = critMeta.get(cid)?.type ?? CriterionType.MAXIMIZE;
        let n = 1;
        if (max > min) {
          n =
            type === CriterionType.MINIMIZE
              ? (max - v) / (max - min)
              : (v - min) / (max - min);
        }
        normalizedByCriterion[cid] = { raw: v, normalized: Number(n.toFixed(6)) };
      }

      let numerator = 0;
      let denom = 0;
      for (const cid of critList) {
        const c = critMeta.get(cid)!;
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
    const strategyLabelUk =
      strategy === 'weighted_minmax'
        ? 'зважені ваги критеріїв (поле weight)'
        : 'рівні ваги всіх критеріїв (ваги ігноруються)';

    const methodUk =
      strategy === 'weighted_minmax'
        ? 'Мінімакс-нормалізація по стовпцях; інтегральна оцінка = зважене середнє нормалізованих значень Σ(wᵢ·ñᵢ)/Σ(wᵢ).'
        : 'Мінімакс-нормалізація по стовпцях; інтегральна оцінка = просте середнє нормалізованих значень (усі wᵢ=1).';

    const explanation = this.buildExplanationUk(best, criteria, strategy, strategyLabelUk);

    return {
      strategy,
      method: methodUk,
      howToRead:
        'Бал ∈ [0; 1]: 1 означає найкраще значення в групі альтернатив за відповідним критерієм після нормалізації; інтегральний бал — згортка з урахуванням обраної стратегії ваг.',
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

  private buildExplanationUk(
    best: ScoredAlternativeRow | undefined,
    criteria: { id: string; name: string; weight?: number }[],
    strategy: RankingStrategy,
    strategyLabelUk: string,
  ): {
    summary: string;
    strategyNote: string;
    contributions: {
      criterionId: string;
      criterionName: string;
      weightUsed: number;
      rawValue: number;
      normalized: number;
      shareOfWeightedSumPercent: number;
    }[];
  } | null {
    const b = best;
    if (!b) return null;

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
    const summary =
      `За стратегією згортки (${strategyLabelUk}) найкращою вважається альтернатива «${b.alternativeName}» ` +
      `з інтегральним балом ${b.score}. Найбільший внесок у цей результат дають критерії: ${namesTop.join(' та ')} ` +
      `(частка в зваженій сумі нормалізованих оцінок — у полі shareOfWeightedSumPercent). ` +
      `Нормалізація мінімаксом усуває різницю одиниць виміру між критеріями.`;

    return {
      summary,
      strategyNote:
        'Порівняйте відповідь з strategy=equal_minmax та strategy=weighted_minmax, щоб побачити вплив експертних ваг.',
      contributions,
    };
  }
}
