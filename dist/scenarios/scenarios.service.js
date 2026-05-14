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
exports.ScenariosService = void 0;
const common_1 = require("@nestjs/common");
const scenarios_repository_1 = require("./scenarios.repository");
let ScenariosService = class ScenariosService {
    constructor(repo) {
        this.repo = repo;
    }
    create(dto) {
        return this.repo.create(dto);
    }
    findAll() {
        return this.repo.findAll();
    }
    async findOne(id) {
        const s = await this.repo.findById(id);
        if (!s)
            throw new common_1.NotFoundException(`Scenario #${id} not found`);
        return s;
    }
    async update(id, dto) {
        const s = await this.repo.update(id, dto);
        if (!s)
            throw new common_1.NotFoundException(`Scenario #${id} not found`);
        return s;
    }
    async remove(id) {
        const s = await this.repo.delete(id);
        if (!s)
            throw new common_1.NotFoundException(`Scenario #${id} not found`);
        return { message: `Scenario #${id} deleted` };
    }
};
exports.ScenariosService = ScenariosService;
exports.ScenariosService = ScenariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scenarios_repository_1.ScenariosRepository])
], ScenariosService);
//# sourceMappingURL=scenarios.service.js.map