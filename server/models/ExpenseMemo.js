const mongoose = require('mongoose');

const expenseLineSchema = new mongoose.Schema({
  code: { type: String, required: true }, // A, B, C, D, E, F
  sectionLabel: { type: String },
  designation: { type: String, required: true },
  nombre: { type: Number, default: 1 },
  prixUnitaire: { type: Number, default: 0 },
  montantTTC: { type: Number, default: 0 },
  tauxIRNC: { type: Number, default: 11 },
  irnc: { type: Number, default: 0 },
  montantNet: { type: Number, default: 0 },
  isFixedAmount: { type: Boolean, default: false },
  fixedAmount: { type: Number, default: 0 },
  lineNumber: { type: Number, default: 0 }
});

const expenseMemoSchema = new mongoose.Schema({
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation', required: true, unique: true },
  formationTitle: { type: String, required: true },
  lines: [expenseLineSchema],
  totals: {
    montantTotalTTC: { type: Number, default: 0 },
    montantTotalIRNC: { type: Number, default: 0 },
    montantTotalNet: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'draft' },
  validationComment: { type: String },
  validatedAt: { type: Date },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const ExpenseMemo = mongoose.model('ExpenseMemo', expenseMemoSchema);
module.exports = ExpenseMemo;