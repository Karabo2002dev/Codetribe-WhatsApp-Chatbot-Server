"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleAuth = void 0;
const roleAuth = (allowedRoles) => (req, res, next) => {
    try {
        const userRole = req.user?.role;
        if (!userRole) {
            return res.status(403).json({
                message: "User role not found"
            });
        }
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.roleAuth = roleAuth;
