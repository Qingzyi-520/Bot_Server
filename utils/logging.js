// utils/logging.js - Logging utilities
import { AdminLog, RoleLog } from '../database/models.js';

// Log admin actions
export async function logAdminAction(action, adminId, targetId, details) {
  const log = new AdminLog({
    action,
    adminId,
    targetId,
    details
  });
  await log.save();
}

// Log role management actions
export async function logRoleAction(action, adminId, targetId, details) {
  const log = new RoleLog({
    action,
    adminId,
    targetId,
    details
  });
  await log.save();
}