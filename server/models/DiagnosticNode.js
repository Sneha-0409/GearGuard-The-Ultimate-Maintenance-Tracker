const { mongoose } = require('../config/database');
const { Schema } = mongoose;

const DiagnosticNodeSchema = new Schema({
  equipmentCategory: { type: String, required: true, index: true },
  isRoot: { type: Boolean, default: false },
  question: { type: String }, 
  rootCause: { type: String }, // Populated if it's a leaf node
  edges: [{
    answer: { type: String, required: true },
    nextNodeId: { type: Schema.Types.ObjectId, ref: 'DiagnosticNode' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('DiagnosticNode', DiagnosticNodeSchema);
