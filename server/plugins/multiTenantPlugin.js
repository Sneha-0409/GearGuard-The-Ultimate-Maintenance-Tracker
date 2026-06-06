const { getTenantContext } = require('../middleware/tenantContext');
const mongoose = require('mongoose');

module.exports = function multiTenantPlugin(schema, options) {
  if (schema.statics && schema.statics.isTenantAware === false) {
    return;
  }

  schema.add({
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      index: true
    }
  });

  const enforceTenantQuery = function (next) {
    const context = getTenantContext();
    if (context && context.role !== 'SystemAdmin') {
      if (context.tenantId) {
        this.where({ organizationId: context.tenantId });
      } else {
        this.where({ organizationId: null }); 
      }
    }
    next();
  };

  const queryTypes = [
    'find',
    'findOne',
    'count',
    'countDocuments',
    'findOneAndUpdate',
    'update',
    'updateOne',
    'updateMany',
    'findOneAndDelete',
    'findOneAndRemove',
    'deleteOne',
    'deleteMany'
  ];

  queryTypes.forEach((type) => {
    schema.pre(type, enforceTenantQuery);
  });

  schema.pre('aggregate', function(next) {
    const context = getTenantContext();
    if (context && context.role !== 'SystemAdmin') {
      if (context.tenantId) {
        this.pipeline().unshift({ $match: { organizationId: new mongoose.Types.ObjectId(context.tenantId) } });
      } else {
        this.pipeline().unshift({ $match: { organizationId: null } });
      }
    }
    next();
  });

  schema.pre('save', function (next) {
    const context = getTenantContext();
    if (context && context.role !== 'SystemAdmin' && context.tenantId) {
      if (!this.organizationId) {
        this.organizationId = context.tenantId;
      }
    }
    next();
  });
  
  schema.pre('insertMany', function (next, docs) {
    const context = getTenantContext();
    if (context && context.role !== 'SystemAdmin' && context.tenantId) {
      if (Array.isArray(docs)) {
        docs.forEach(doc => {
          if (!doc.organizationId) doc.organizationId = context.tenantId;
        });
      }
    }
    next();
  });
};
