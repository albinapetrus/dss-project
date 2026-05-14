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
exports.EvaluationsService = void 0;
const common_1 = require("@nestjs/common");
const evaluations_repository_1 = require("./evaluations.repository");
let EvaluationsService = class EvaluationsService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const existing = await this.repo.findByPair(dto.alternativeId, dto.criterionId);
        if (existing) {
            throw new common_1.ConflictException(`Evaluation for alternative ${dto.alternativeId} and criterion ${dto.criterionId} already exists. Use PATCH to update.`);
        }
        return this.repo.create(dto);
    }
    async findAll() {
        return this.repo.findAll();
    }
    async update(id, dto) {
        const updated = await this.repo.update(id, dto);
        if (!updated)
            throw new common_1.NotFoundException(`Evaluation #${id} not found`);
        return updated;
    }
    async upsertPair(alternativeId, criterionId, value) {
        return this.repo.upsertByPair(alternativeId, criterionId, value);
    }
};
exports.EvaluationsService = EvaluationsService;
exports.EvaluationsService = EvaluationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [evaluations_repository_1.EvaluationsRepository])
], EvaluationsService);
//# sourceMappingURL=evaluations.service.js.map