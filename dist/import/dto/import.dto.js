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
exports.ImportCriterionVotesDto = exports.CriterionVoteRowDto = exports.ImportExpertEvaluationsDto = exports.ExpertEvalRowDto = exports.CriterionVotingMethod = exports.ExpertConsensusMethod = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ExpertConsensusMethod;
(function (ExpertConsensusMethod) {
    ExpertConsensusMethod["ALGEBRAIC_MEAN"] = "algebraic_mean";
    ExpertConsensusMethod["MEDIAN"] = "median";
    ExpertConsensusMethod["GEOMETRIC_MEAN"] = "geometric_mean";
})(ExpertConsensusMethod || (exports.ExpertConsensusMethod = ExpertConsensusMethod = {}));
var CriterionVotingMethod;
(function (CriterionVotingMethod) {
    CriterionVotingMethod["MEAN_RANK"] = "mean_rank";
    CriterionVotingMethod["BORDA"] = "borda";
    CriterionVotingMethod["MEDIAN_RANK"] = "median_rank";
    CriterionVotingMethod["RECIPROCAL_RANK"] = "reciprocal_rank";
})(CriterionVotingMethod || (exports.CriterionVotingMethod = CriterionVotingMethod = {}));
class ExpertEvalRowDto {
}
exports.ExpertEvalRowDto = ExpertEvalRowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExpertEvalRowDto.prototype, "expertKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExpertEvalRowDto.prototype, "alternativeKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExpertEvalRowDto.prototype, "criterionKey", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ExpertEvalRowDto.prototype, "value", void 0);
class ImportExpertEvaluationsDto {
}
exports.ImportExpertEvaluationsDto = ImportExpertEvaluationsDto;
__decorate([
    (0, class_validator_1.IsEnum)(ExpertConsensusMethod),
    __metadata("design:type", String)
], ImportExpertEvaluationsDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExpertEvalRowDto),
    __metadata("design:type", Array)
], ImportExpertEvaluationsDto.prototype, "rows", void 0);
class CriterionVoteRowDto {
}
exports.CriterionVoteRowDto = CriterionVoteRowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriterionVoteRowDto.prototype, "expertKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriterionVoteRowDto.prototype, "criterionKey", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CriterionVoteRowDto.prototype, "rankPosition", void 0);
class ImportCriterionVotesDto {
}
exports.ImportCriterionVotesDto = ImportCriterionVotesDto;
__decorate([
    (0, class_validator_1.IsEnum)(CriterionVotingMethod),
    __metadata("design:type", String)
], ImportCriterionVotesDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CriterionVoteRowDto),
    __metadata("design:type", Array)
], ImportCriterionVotesDto.prototype, "rows", void 0);
//# sourceMappingURL=import.dto.js.map