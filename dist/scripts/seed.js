"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dss';
const AlternativeSchema = new mongoose_1.default.Schema({ name: { type: String, required: true, trim: true }, description: { type: String, trim: true } }, { timestamps: true, collection: 'alternatives' });
const CriterionSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['maximize', 'minimize'] },
    description: { type: String, trim: true },
    weight: { type: Number, default: 1, min: 0.0001 },
}, { timestamps: true, collection: 'criteria' });
const EvaluationSchema = new mongoose_1.default.Schema({
    alternativeId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Alternative', required: true },
    criterionId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Criterion', required: true },
    value: { type: Number, required: true },
}, { timestamps: true, collection: 'evaluations' });
EvaluationSchema.index({ alternativeId: 1, criterionId: 1 }, { unique: true });
async function main() {
    await mongoose_1.default.connect(uri);
    const Alternative = mongoose_1.default.model('SeedAlternative', AlternativeSchema);
    const Criterion = mongoose_1.default.model('SeedCriterion', CriterionSchema);
    const Evaluation = mongoose_1.default.model('SeedEvaluation', EvaluationSchema);
    await Evaluation.deleteMany({});
    await Alternative.deleteMany({});
    await Criterion.deleteMany({});
    const alts = await Alternative.insertMany([
        { name: 'Shopify', description: 'SaaS-платформа, підписка та маркетплейс додатків' },
        { name: 'WooCommerce', description: 'Плагін до WordPress, self-hosted' },
        { name: 'Власна розробка (custom)', description: 'Індивідуальний стек і команда' },
    ]);
    const crits = await Criterion.insertMany([
        {
            name: 'Вартість запуску (тис. EUR)',
            type: 'minimize',
            description: 'Орієнтовні початкові витрати; менше — краще',
            weight: 0.35,
        },
        {
            name: 'Термін до запуску MVP (тиж.)',
            type: 'minimize',
            description: 'Менше тижнів — краще',
            weight: 0.3,
        },
        {
            name: 'Гнучкість і масштабованість (0–10)',
            type: 'maximize',
            description: 'Експертна оцінка можливостей кастомізації; більше — краще',
            weight: 0.35,
        },
    ]);
    const byName = (items, n) => items.find((x) => x.name === n)._id;
    const shopify = byName(alts, 'Shopify');
    const woo = byName(alts, 'WooCommerce');
    const custom = byName(alts, 'Власна розробка (custom)');
    const cCost = byName(crits, 'Вартість запуску (тис. EUR)');
    const cTime = byName(crits, 'Термін до запуску MVP (тиж.)');
    const cFlex = byName(crits, 'Гнучкість і масштабованість (0–10)');
    await Evaluation.insertMany([
        { alternativeId: shopify, criterionId: cCost, value: 15 },
        { alternativeId: shopify, criterionId: cTime, value: 4 },
        { alternativeId: shopify, criterionId: cFlex, value: 6 },
        { alternativeId: woo, criterionId: cCost, value: 9 },
        { alternativeId: woo, criterionId: cTime, value: 8 },
        { alternativeId: woo, criterionId: cFlex, value: 7 },
        { alternativeId: custom, criterionId: cCost, value: 45 },
        { alternativeId: custom, criterionId: cTime, value: 24 },
        { alternativeId: custom, criterionId: cFlex, value: 10 },
    ]);
    console.log('Seed OK: 3 alternatives, 3 criteria (з вагами), 9 evaluations.');
    await mongoose_1.default.disconnect();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map