/**
 * Middleware kiểm tra Permission (tương tự Claim-based Authorization ASP.NET Core)
 * Sử dụng: requirePermission('ManageBooking')
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.permissions) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    const hasPermission = permissions.every((perm) =>
      req.permissions.includes(perm)
    );
    if (!hasPermission) {
      return res.status(403).json({ message: `Yêu cầu quyền: ${permissions.join(', ')}` });
    }
    next();
  };
};

const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.permissions) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    const hasAny = permissions.some((perm) => req.permissions.includes(perm));
    if (!hasAny) {
      return res.status(403).json({ message: `Yêu cầu một trong các quyền: ${permissions.join(', ')}` });
    }
    next();
  };
};

module.exports = { requirePermission, requireAnyPermission };
