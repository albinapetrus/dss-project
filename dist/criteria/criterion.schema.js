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
exports.CriterionSchema = exports.Criterion = exports.CriterionType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var CriterionType;
(function (CriterionType) {
    CriterionType["MAXIMIZE"] = "maximize";
    CriterionType["MINIMIZE"] = "minimize";
})(CriterionType || (exports.CriterionType = CriterionType = {}));
let Criterion = class Criterion {
};
exports.Criterion = Criterion;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Criterion.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: CriterionType }),
    __metadata("design:type", String)
], Criterion.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Criterion.prototype, "description", void 0);
exports.Criterion = Criterion = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'criteria' })
], Criterion);
exports.CriterionSchema = mongoose_1.SchemaFactory.createForClass(Criterion);
//# sourceMappingURL=criterion.schema.js.map