"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlternativesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const alternative_schema_1 = require("./alternative.schema");
const alternatives_repository_1 = require("./alternatives.repository");
const alternatives_service_1 = require("./alternatives.service");
const alternatives_controller_1 = require("./alternatives.controller");
let AlternativesModule = class AlternativesModule {
};
exports.AlternativesModule = AlternativesModule;
exports.AlternativesModule = AlternativesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: alternative_schema_1.Alternative.name, schema: alternative_schema_1.AlternativeSchema }]),
        ],
        providers: [alternatives_repository_1.AlternativesRepository, alternatives_service_1.AlternativesService],
        controllers: [alternatives_controller_1.AlternativesController],
        exports: [alternatives_service_1.AlternativesService],
    })
], AlternativesModule);
//# sourceMappingURL=alternatives.module.js.map