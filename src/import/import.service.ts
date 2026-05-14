import { BadRequestException, Injectable } from '@nestjs/common';
import { AlternativesService } from '../alternatives/alternatives.service';
import { CriteriaService } from '../criteria/criteria.service';
import { EvaluationsService } from '../evaluations/evaluations.service';
import {
  CriterionVotingMethod,
  ExpertConsensusMethod,
  ImportCriterionVotesDto,
  ImportExpertEvaluationsDto,
} from './dto/import.dto';

function normKey(s: string): string {
  if (s == null || typeof s !== 'string') return '';
  return s
    .replace(/^\uFEFF/, '')
    .replace(/\u00A0/g, ' ')
    .trim()
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .toLowerCase();
}

function algebraicMean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function geometricMean(values: number[]): number {
  const pos = values.filter((v) => v > 0);
  if (pos.length !== values.length) {
    throw new BadRequestException('Геометричне середнє потребує додатних оцінок.');
  }
  return Math.exp(pos.reduce((s, v) => s + Math.log(v), 0) / pos.length);
}

function medianSorted(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  return medianSorted(s);
}

@Injectable()
export class ImportService {
  constructor(
    private readonly alternatives: AlternativesService,
    private readonly criteria: CriteriaService,
    private readonly evaluations: EvaluationsService,
  ) {}

  async importExpertEvaluations(dto: ImportExpertEvaluationsDto) {
    const [alts, crits] = await Promise.all([this.alternatives.findAll(), this.criteria.findAll()]);
    const altByName = new Map(alts.map((a) => [normKey(a.name), a]));
    const critByName = new Map(crits.map((c) => [normKey(c.name), c]));

    const unresolved: string[] = [];
    const pairs = new Map<string, number[]>();

    for (const row of dto.rows) {
      const a = altByName.get(normKey(row.alternativeKey));
      const c = critByName.get(normKey(row.criterionKey));
      if (!a || !c) {
        unresolved.push(`${row.alternativeKey} / ${row.criterionKey}`);
        continue;
      }
      const key = `${(a as { _id: { toString(): string } })._id.toString()}:${(c as { _id: { toString(): string } })._id.toString()}`;
      if (!pairs.has(key)) pairs.set(key, []);
      pairs.get(key)!.push(row.value);
    }

    if (unresolved.length) {
      throw new BadRequestException({
        message: 'Невідомі назви альтернатив або критеріїв.',
        unresolved: [...new Set(unresolved)].slice(0, 50),
        availableAlternatives: alts.map((a) => a.name),
        availableCriteria: crits.map((c) => c.name),
      });
    }

    const aggregated = new Map<string, number>();
    for (const [key, vals] of pairs) {
      let v: number;
      if (dto.method === ExpertConsensusMethod.ALGEBRAIC_MEAN) v = algebraicMean(vals);
      else if (dto.method === ExpertConsensusMethod.MEDIAN) v = median(vals);
      else v = geometricMean(vals);
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

  async importCriterionVotes(dto: ImportCriterionVotesDto) {
    const crits = await this.criteria.findAll();
    const critByName = new Map(crits.map((c) => [normKey(c.name), c]));

    const byCrit = new Map<string, number[]>();
    const experts = new Set<string>();

    for (const row of dto.rows) {
      const c = critByName.get(normKey(row.criterionKey));
      if (!c) {
        throw new BadRequestException(`Невідомий критерій: ${row.criterionKey}`);
      }
      const id = (c as { _id: { toString(): string } })._id.toString();
      experts.add(row.expertKey);
      if (!byCrit.has(id)) byCrit.set(id, []);
      byCrit.get(id)!.push(row.rankPosition);
    }

    const critIds = [...byCrit.keys()];
    if (critIds.length === 0) {
      throw new BadRequestException('Немає даних для голосування.');
    }
    const nCrit = critIds.length;

    const scores: Record<string, number> = {};
    for (const cid of critIds) {
      const ranks = byCrit.get(cid)!;
      if (dto.method === CriterionVotingMethod.MEAN_RANK) {
        const avg = algebraicMean(ranks);
        scores[cid] = 1 / avg;
      } else if (dto.method === CriterionVotingMethod.BORDA) {
        scores[cid] = ranks.reduce((s, r) => s + (nCrit - r), 0);
      } else if (dto.method === CriterionVotingMethod.MEDIAN_RANK) {
        const med = median(ranks);
        scores[cid] = 1 / med;
      } else {
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
}
