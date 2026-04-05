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
exports.AlternativesService = void 0;
const common_1 = require("@nestjs/common");
const alternatives_repository_1 = require("./alternatives.repository");
let AlternativesService = class AlternativesService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        return this.repo.create(dto);
    }
    async findAll() {
        return this.repo.findAll();
    }
    async findOne(id) {
        const found = await this.repo.findById(id);
        if (!found)
            throw new common_1.NotFoundException(`Alternative #${id} not found`);
        return found;
    }
    async update(id, dto) {
        const updated = await this.repo.update(id, dto);
        if (!updated)
            throw new common_1.NotFoundException(`Alternative #${id} not found`);
        return updated;
    }
    async remove(id) {
        const deleted = await this.repo.delete(id);
        if (!deleted)
            throw new common_1.NotFoundException(`Alternative #${id} not found`);
        return { message: `Alternative #${id} deleted successfully` };
    }
};
exports.AlternativesService = AlternativesService;
exports.AlternativesService = AlternativesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [alternatives_repository_1.AlternativesRepository])
], AlternativesService);
//# sourceMappingURL=alternatives.service.js.map