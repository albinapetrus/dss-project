import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { AnalyticsService, RankingStrategy } from './analytics.service';

const RANKING_STRATEGIES: RankingStrategy[] = ['weighted_minmax', 'equal_minmax'];

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('matrix')
  getMatrix() {
    return this.service.getEvaluationMatrix();
  }

  /**
   * strategy=weighted_minmax (за замовчуванням) — використовує поле weight критеріїв.
   * strategy=equal_minmax — рівні ваги (бонус: інший метод згортки).
   */
  @Get('rankings')
  calculateRankings(@Query('strategy') strategy?: string) {
    const key = (strategy ?? 'weighted_minmax').trim().toLowerCase();
    if (!RANKING_STRATEGIES.includes(key as RankingStrategy)) {
      throw new BadRequestException({
        message: `Невідома стратегія. Допустимо: ${RANKING_STRATEGIES.join(', ')}`,
        allowed: RANKING_STRATEGIES,
      });
    }
    return this.service.calculateRankings(key as RankingStrategy);
  }
}
