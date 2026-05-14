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
exports.RulesService = void 0;
const common_1 = require("@nestjs/common");
const rules_repository_1 = require("./rules.repository");
let RulesService = class RulesService {
    constructor(repo) {
        this.repo = repo;
    }
    create(dto) {
        return this.repo.create(dto);
    }
    findAll() {
        return this.repo.findAll();
    }
    findEnabled() {
        return this.repo.findEnabled();
    }
    async findOne(id) {
        const r = await this.repo.findById(id);
        if (!r)
            throw new common_1.NotFoundException(`Rule #${id} not found`);
        return r;
    }
    async update(id, dto) {
        const r = await this.repo.update(id, dto);
        if (!r)
            throw new common_1.NotFoundException(`Rule #${id} not found`);
        return r;
    }
    async remove(id) {
        const r = await this.repo.delete(id);
        if (!r)
            throw new common_1.NotFoundException(`Rule #${id} not found`);
        return { message: `Rule #${id} deleted` };
    }
};
exports.RulesService = RulesService;
exports.RulesService = RulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rules_repository_1.RulesRepository])
], RulesService);
//# sourceMappingURL=rules.service.js.map