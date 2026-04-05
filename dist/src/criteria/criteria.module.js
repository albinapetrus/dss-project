"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriteriaModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const criterion_schema_1 = require("./criterion.schema");
const criteria_repository_1 = require("./criteria.repository");
const criteria_service_1 = require("./criteria.service");
const criteria_controller_1 = require("./criteria.controller");
let CriteriaModule = class CriteriaModule {
};
exports.CriteriaModule = CriteriaModule;
exports.CriteriaModule = CriteriaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: criterion_schema_1.Criterion.name, schema: criterion_schema_1.CriterionSchema }]),
        ],
        providers: [criteria_repository_1.CriteriaRepository, criteria_service_1.CriteriaService],
        controllers: [criteria_controller_1.CriteriaController],
        exports: [criteria_service_1.CriteriaService],
    })
], CriteriaModule);
//# sourceMappingURL=criteria.module.js.map