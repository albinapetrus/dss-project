# DSS Core Framework

A Decision Support System (DSS) built with NestJS, MongoDB Atlas, and Mongoose.

## Setup

```bash
npm install
```

Set your MongoDB Atlas URI in a `.env` file:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dss
```

## Running

```bash
# Development
npm run start:dev

# Production
npm run build && npm run start:prod
```

## Project Structure

```
src/
├── alternatives/        # Alternatives CRUD (Controller / Service / Repository)
│   ├── dto/
│   ├── alternative.schema.ts
│   ├── alternatives.repository.ts
│   ├── alternatives.service.ts
│   ├── alternatives.controller.ts
│   └── alternatives.module.ts
│
├── criteria/            # Criteria CRUD (with maximize/minimize type)
│   ├── dto/
│   ├── criterion.schema.ts
│   ├── criteria.repository.ts
│   ├── criteria.service.ts
│   ├── criteria.controller.ts
│   └── criteria.module.ts
│
├── evaluations/         # Evaluation Matrix (Alternative × Criterion → Value)
│   ├── dto/
│   ├── evaluation.schema.ts
│   ├── evaluations.repository.ts
│   ├── evaluations.service.ts
│   ├── evaluations.controller.ts
│   └── evaluations.module.ts
│
├── analytics/           # Analytics placeholder — future MCDA algorithms
│   ├── analytics.service.ts
│   ├── analytics.controller.ts
│   └── analytics.module.ts
│
├── app.module.ts
└── main.ts
```

## API Base URL

```
http://localhost:3000/api/v1
```

## Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /alternatives | Create alternative |
| GET | /alternatives | List all alternatives |
| GET | /alternatives/:id | Get alternative by ID |
| PATCH | /alternatives/:id | Update alternative |
| DELETE | /alternatives/:id | Delete alternative |
| POST | /criteria | Create criterion |
| GET | /criteria | List all criteria |
| GET | /criteria/:id | Get criterion by ID |
| PATCH | /criteria/:id | Update criterion |
| DELETE | /criteria/:id | Delete criterion |
| POST | /evaluations | Assign value to Alt×Criterion pair |
| GET | /evaluations | Get full evaluation matrix |
| GET | /analytics/rankings | Rankings stub (ready for integration) |
