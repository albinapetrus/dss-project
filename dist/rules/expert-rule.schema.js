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
exports.ExpertRuleSchema = exports.ExpertRule = exports.RuleAction = exports.RuleOperator = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var RuleOperator;
(function (RuleOperator) {
    RuleOperator["GT"] = "gt";
    RuleOperator["GTE"] = "gte";
    RuleOperator["LT"] = "lt";
    RuleOperator["LTE"] = "lte";
    RuleOperator["EQ"] = "eq";
})(RuleOperator || (exports.RuleOperator = RuleOperator = {}));
var RuleAction;
(function (RuleAction) {
    RuleAction["EXCLUDE"] = "exclude_alternative";
    RuleAction["PENALTY"] = "score_penalty";
})(RuleAction || (exports.RuleAction = RuleAction = {}));
let ExpertRule = class ExpertRule {
};
exports.ExpertRule = ExpertRule;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ExpertRule.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ExpertRule.prototype, "enabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Criterion', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ExpertRule.prototype, "criterionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: RuleOperator, required: true }),
    __metadata("design:type", String)
], ExpertRule.prototype, "operator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], ExpertRule.prototype, "thresholdValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: RuleAction, required: true }),
    __metadata("design:type", String)
], ExpertRule.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, min: 0, max: 100 }),
    __metadata("design:type", Number)
], ExpertRule.prototype, "penaltyPercent", void 0);
exports.ExpertRule = ExpertRule = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'expert_rules' })
], ExpertRule);
exports.ExpertRuleSchema = mongoose_1.SchemaFactory.createForClass(ExpertRule);
//# sourceMappingURL=expert-rule.schema.js.map