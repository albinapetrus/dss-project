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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const expert_rule_schema_1 = require("./expert-rule.schema");
let RulesRepository = class RulesRepository {
    constructor(model) {
        this.model = model;
    }
    create(dto) {
        return this.model.create({
            ...dto,
            enabled: dto.enabled ?? true,
        });
    }
    findAll() {
        return this.model.find().sort({ createdAt: -1 }).exec();
    }
    findEnabled() {
        return this.model.find({ enabled: true }).exec();
    }
    findById(id) {
        return this.model.findById(id).exec();
    }
    update(id, dto) {
        return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    }
    delete(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
};
exports.RulesRepository = RulesRepository;
exports.RulesRepository = RulesRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(expert_rule_schema_1.ExpertRule.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RulesRepository);
//# sourceMappingURL=rules.repository.js.map