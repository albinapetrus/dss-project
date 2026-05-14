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
exports.EvaluationsRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const evaluation_schema_1 = require("./evaluation.schema");
let EvaluationsRepository = class EvaluationsRepository {
    constructor(evaluationModel) {
        this.evaluationModel = evaluationModel;
    }
    async create(dto) {
        return this.evaluationModel.create(dto);
    }
    async findAll() {
        return this.evaluationModel
            .find()
            .populate('alternativeId', 'name description')
            .populate('criterionId', 'name type description')
            .exec();
    }
    async findByPair(alternativeId, criterionId) {
        return this.evaluationModel.findOne({ alternativeId, criterionId }).exec();
    }
    async findById(id) {
        return this.evaluationModel.findById(id).exec();
    }
    async update(id, dto) {
        return this.evaluationModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .populate('alternativeId', 'name description')
            .populate('criterionId', 'name type description')
            .exec();
    }
    async upsertByPair(alternativeId, criterionId, value) {
        return this.evaluationModel
            .findOneAndUpdate({ alternativeId, criterionId }, { $set: { alternativeId, criterionId, value } }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .populate('alternativeId', 'name description')
            .populate('criterionId', 'name type description')
            .exec();
    }
};
exports.EvaluationsRepository = EvaluationsRepository;
exports.EvaluationsRepository = EvaluationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(evaluation_schema_1.Evaluation.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EvaluationsRepository);
//# sourceMappingURL=evaluations.repository.js.map