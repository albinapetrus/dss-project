# СППР: система підтримки прийняття рішень

Програмний продукт для багатокритеріального вибору альтернатив (демо-задача: **платформа e-commerce**). Реалізує модель предметної області, матрицю оцінювання, аналітичний блок із **вагами критеріїв**, ранжування, явний вибір найкращої альтернативи та **пояснення** результату. Доступ: **REST API** (NestJS) та **веб-інтерфейс** (React + Vite у каталозі `frontend/`).

## Репозиторій

Після розміщення коду на GitHub/GitLab додайте посилання тут і в `docs/DSS_DOKUMENTATSIYA_UK.md` (розділ 5).

## Вимоги

- Node.js 18+
- MongoDB (локально або URI у хмарі)

## Запуск

```bash
npm install
# за потреби: export MONGODB_URI=mongodb://127.0.0.1:27017/dss
npm run seed      # демо: 3 альтернативи, 3 критерії з вагами, повна матриця
npm run start:dev # API: http://localhost:3000/api/v1 (точка входу: dist/main.js, не dist/src/main.js)
```

**Запуск зібраного бекенда без watch:** спочатку `npm run build`, потім `npm run start:prod` (це `node dist/main.js`). У WebStorm/Cursor скрипт має бути саме **`dist/main.js`**, робоча папка — **корінь `dss-project`**. Якщо бачите `Cannot find module '.../dist/main'` — файлу ще немає (не виконано `npm run build`) або вказано шлях **без `.js`**.

Якщо після змін коду з’являється `Cannot find module './alternatives/...'` у **watch**-режимі: зупиніть процес і виконайте `npm run build`, потім знову `npm run start:dev` (повна перезбірка `dist/`).

### Фронтенд

У другому терміналі:

```bash
cd frontend && npm install && npm run dev
```

Відкрийте **http://localhost:5173** — інтерфейс проксує запити на API (`/api/v1` → порт 3000). Переконайтеся, що MongoDB запущена й за потреби виконано `npm run seed`.

Якщо збираєте статичний `frontend/dist` і віддаєте його окремо, задайте повний URL API: `VITE_API_BASE=https://ваш-хост/api/v1 npm run build`.

Корисні запити (без браузера):

- `GET /api/v1/health` — перевірка, що запущено **цей** бекенд (`buildTag: dss-rules-scenarios-v1`)
- `GET /api/v1/rules` — список правил (може бути `[]`)
- `GET /api/v1/analytics/matrix` — матриця оцінювання
- `GET /api/v1/analytics/rankings` — рейтинг і **bestAlternative** (зважені ваги з БД)
- `GET /api/v1/analytics/rankings?strategy=equal_minmax` — та сама нормалізація, **рівні ваги** (другий метод згортки)

### Якщо `Cannot GET /api/v1/rules` (404)

1. Зупиніть **усі** процеси Node на порту 3000: `lsof -i :3000` → `kill -9 <PID>`.
2. З кореня репозиторію: `npm run build` (очищає `dist/` і збирає заново; **не** запускайте `node dist/src/main.js`).
3. `npm run start:dev` або `npm run start:prod`.
4. У консолі бекенда має з’явитись рядок `[DSS] RulesModule OK` і мапінг `RulesController {/api/v1/rules}`.
5. Перевірте: `curl http://127.0.0.1:3000/api/v1/health` — у відповіді має бути `"buildTag":"dss-rules-scenarios-v1"`. Якщо health дає 404 — на 3000 порту **інший** додаток або дуже старий білд.

У WebStorm **не** вказуйте JavaScript entrypoint `dist/src/main.js` — лише **`dist/main.js`** після `npm run build`.

## Документація до захисту

Повний опис архітектури, ER-діаграма, формалізація множин A і C, приклад даних, **таблиця відповідності всім 9 критеріям оцінювання + бонусам** (§0.3–0.5), місце для URL репозиторію:

**[docs/DSS_DOKUMENTATSIYA_UK.md](docs/DSS_DOKUMENTATSIYA_UK.md)**

## Структура системи

- **Controller → Service → Repository** для `alternatives`, `criteria`, `evaluations`
- Модуль **`analytics`** — обчислення інтегральної оцінки, ранжування, пояснення (без прямого залежання від чужих репозиторіїв)

## Ліцензія

Навчальний проєкт.
