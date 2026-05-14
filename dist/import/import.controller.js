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
exports.ImportController = void 0;
const common_1 = require("@nestjs/common");
const import_service_1 = require("./import.service");
const import_dto_1 = require("./dto/import.dto");
let ImportController = class ImportController {
    constructor(service) {
        this.service = service;
    }
    importExperts(dto) {
        return this.service.importExpertEvaluations(dto);
    }
    importVotes(dto) {
        return this.service.importCriterionVotes(dto);
    }
};
exports.ImportController = ImportController;
__decorate([
    (0, common_1.Post)('expert-evaluations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_dto_1.ImportExpertEvaluationsDto]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "importExperts", null);
__decorate([
    (0, common_1.Post)('criterion-votes'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_dto_1.ImportCriterionVotesDto]),
    __metadata("design:returntype", void 0)
], ImportController.prototype, "importVotes", null);
exports.ImportController = ImportController = __decorate([
    (0, common_1.Controller)('import'),
    __metadata("design:paramtypes", [import_service_1.ImportService])
], ImportController);
//# sourceMappingURL=import.controller.js.map