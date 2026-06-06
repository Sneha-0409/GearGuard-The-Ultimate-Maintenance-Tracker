const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

const tenantContextMiddleware = (req, res, next) => {
  const tenantId = req.user?.organizationId;
  const role = req.user?.role;
  
  const context = {
    tenantId: tenantId ? tenantId.toString() : null,
    role: role || null,
  };

  asyncLocalStorage.run(context, () => {
    next();
  });
};

const getTenantContext = () => {
  return asyncLocalStorage.getStore();
};

module.exports = {
  tenantContextMiddleware,
  getTenantContext,
  asyncLocalStorage
};
