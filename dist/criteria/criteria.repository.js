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
exports.CriteriaRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const criterion_schema_1 = require("./criterion.schema");
let CriteriaRepository = class CriteriaRepository {
    constructor(criterionModel) {
        this.criterionModel = criterionModel;
    }
    async create(dto) {
        return this.criterionModel.create(dto);
    }
    async findAll() {
        return this.criterionModel.find().exec();
    }
    async findById(id) {
        return this.criterionModel.findById(id).exec();
    }
    async update(id, dto) {
        return this.criterionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    }
    async delete(id) {
        return this.criterionModel.findByIdAndDelete(id).exec();
    }
};
exports.CriteriaRepository = CriteriaRepository;
exports.CriteriaRepository = CriteriaRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(criterion_schema_1.Criterion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CriteriaRepository);
//# sourceMappingURL=criteria.repository.js.map