const passport = require('passport');

exports.authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    if (!user) return res.status(401).json({ error: 'Invalid or missing token' });
    req.user = user;
    next();
  })(req, res, next);
};

// RBAC: Require user to have a specific role
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.roleId) return res.status(403).json({ error: 'Forbidden' });
  // Fetch role name from req.user.role (if populated) or DB
  if (req.user.role && roles.includes(req.user.role.name)) return next();
  // If not populated, fetch from DB
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.role.findUnique({ where: { id: req.user.roleId } }).then(role => {
    if (role && roles.includes(role.name)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  });
};

// RBAC: Require user to have a specific permission
exports.requirePermission = (...permissions) => async (req, res, next) => {
  if (!req.user || !req.user.roleId) return res.status(403).json({ error: 'Forbidden' });
  // Fetch role from req.user.role (if populated) or DB
  let role = req.user.role;
  if (!role) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    role = await prisma.role.findUnique({ where: { id: req.user.roleId } });
  }
  if (!role) return res.status(403).json({ error: 'Forbidden' });
  let userPerms = [];
  try {
    userPerms = JSON.parse(role.permissions || '[]');
  } catch {}
  if (permissions.some(p => userPerms.includes(p))) return next();
  return res.status(403).json({ error: 'Forbidden' });
};
