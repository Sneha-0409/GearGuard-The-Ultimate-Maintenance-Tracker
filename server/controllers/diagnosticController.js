const DiagnosticNode = require('../models/DiagnosticNode');
const { ErrorHandler, ERROR_TYPES } = require('../utils/errorHandler');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all nodes for a specific category
exports.getTreeByCategory = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const nodes = await DiagnosticNode.find({ equipmentCategory: category });
  res.status(200).json({ success: true, data: nodes });
});

// Save (Create/Update/Delete) a tree for a category
exports.saveTree = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const { nodes } = req.body; // Array of node objects

  if (!Array.isArray(nodes)) {
    throw new ErrorHandler("Nodes must be an array", ERROR_TYPES.VALIDATION_ERROR);
  }

  // To properly update the tree, we can clear the existing one and recreate it,
  // but to preserve ObjectIds for active tickets, it's better to upsert and delete missing.
  
  const incomingIds = nodes.map(n => n._id).filter(id => id && !id.startsWith('new_'));
  
  // Delete nodes that are not in the incoming payload
  await DiagnosticNode.deleteMany({
    equipmentCategory: category,
    _id: { $nin: incomingIds }
  });

  // Keep track of new IDs mapping
  const idMapping = {};

  // First pass: Create new nodes so we have their ObjectIds
  for (const nodeData of nodes) {
    if (!nodeData._id || nodeData._id.startsWith('new_')) {
      const newNode = new DiagnosticNode({
        equipmentCategory: category,
        isRoot: nodeData.isRoot,
        question: nodeData.question,
        rootCause: nodeData.rootCause
        // edges will be linked in pass 2
      });
      await newNode.save();
      idMapping[nodeData._id] = newNode._id.toString();
      nodeData._actualId = newNode._id.toString();
    } else {
      nodeData._actualId = nodeData._id;
    }
  }

  // Second pass: Update all nodes with correct edges
  for (const nodeData of nodes) {
    const edges = (nodeData.edges || []).map(edge => ({
      answer: edge.answer,
      nextNodeId: idMapping[edge.nextNodeId] || edge.nextNodeId
    }));

    await DiagnosticNode.findByIdAndUpdate(nodeData._actualId, {
      equipmentCategory: category,
      isRoot: nodeData.isRoot || false,
      question: nodeData.question,
      rootCause: nodeData.rootCause,
      edges
    });
  }

  const updatedNodes = await DiagnosticNode.find({ equipmentCategory: category });
  res.status(200).json({ success: true, data: updatedNodes });
});

// Check if a category has an active RCA tree
exports.hasActiveTree = asyncHandler(async (req, res, next) => {
  const { category } = req.params;
  const rootNode = await DiagnosticNode.findOne({ equipmentCategory: category, isRoot: true });
  res.status(200).json({ success: true, hasTree: !!rootNode });
});
