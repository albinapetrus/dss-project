import { Controller, Get } from '@nestjs/common';

/** Діагностика: якщо цей маршрут відповідає, піднято актуальний білд dss-project. */
@Controller('health')
export class HealthController {
  @Get()
  ping() {
    return {
      ok: true,
      service: 'dss-backend',
      buildTag: 'dss-rules-scenarios-v1',
      hint: 'Якщо /health ок, а /rules — 404, на порту все ще старий процес або не той dist.',
    };
  }
}
