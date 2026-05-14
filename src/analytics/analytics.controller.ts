import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AnalyticsService, FoldMethod, LegacyRankingStrategy, WeightMode } from './analytics.service';

const FOLD: FoldMethod[] = ['additive', 'cautious_min', 'multiplicative'];
const WEIGHT: WeightMode[] = ['weighted', 'equal'];
const LEGACY: LegacyRankingStrategy[] = ['weighted_minmax', 'equal_minmax'];

function parseFold(s?: string): FoldMethod {
  const k = (s ?? 'additive').trim().toLowerCase();
  if (!FOLD.includes(k as FoldMethod)) {
    throw new BadRequestException({ message: `Невідомий fold. Допустимо: ${FOLD.join(', ')}`, allowed: FOLD });
  }
  return k as FoldMethod;
}

function parseWeightMode(s?: string): WeightMode {
  const k = (s ?? 'weighted').trim().toLowerCase();
  if (!WEIGHT.includes(k as WeightMode)) {
    throw new BadRequestException({ message: `Невідомий weightMode. Допустимо: ${WEIGHT.join(', ')}`, allowed: WEIGHT });
  }
  return k as WeightMode;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('matrix')
  getMatrix() {
    return this.service.getEvaluationMatrix();
  }

  /**
   * Параметри: fold, weightMode, scenarioId (опційно).
   * Legacy: strategy=weighted_minmax|equal_minmax еквівалентні fold=additive з відповідним weightMode.
   */
  @Get('rankings')
  calculateRankings(
    @Query('fold') fold?: string,
    @Query('weightMode') weightMode?: string,
    @Query('scenarioId') scenarioId?: string,
    @Query('strategy') strategy?: string,
  ) {
    const legacy = strategy?.trim().toLowerCase();
    if (legacy && LEGACY.includes(legacy as LegacyRankingStrategy)) {
      const { fold: f, weightMode: w } = this.service.resolveLegacyStrategy(legacy as LegacyRankingStrategy);
      return this.service.calculateRankings(f, w, scenarioId);
    }
    return this.service.calculateRankings(parseFold(fold), parseWeightMode(weightMode), scenarioId);
  }

  @Get('rankings-compare')
  rankingsCompare(@Query('weightMode') weightMode?: string, @Query('scenarioId') scenarioId?: string) {
    return this.service.rankingsCompare(parseWeightMode(weightMode), scenarioId);
  }

  @Get('sensitivity')
  sensitivity(
    @Query('criterionId') criterionId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('steps') steps: string,
    @Query('fold') fold?: string,
    @Query('weightMode') weightMode?: string,
  ) {
    if (!criterionId) throw new BadRequestException('Задайте criterionId');
    const f = parseFloat(from);
    const t = parseFloat(to);
    const st = parseInt(steps ?? '8', 10);
    return this.service.sensitivity(criterionId, f, t, st, parseFold(fold), parseWeightMode(weightMode));
  }

  @Get('stability')
  stability(
    @Query('fold') fold?: string,
    @Query('weightMode') weightMode?: string,
    @Query('samples') samples?: string,
    @Query('relativeNoise') relativeNoise?: string,
  ) {
    const n = parseInt(samples ?? '25', 10);
    const rn = parseFloat(relativeNoise ?? '0.08');
    return this.service.stability(parseFold(fold), parseWeightMode(weightMode), n, rn);
  }
}
