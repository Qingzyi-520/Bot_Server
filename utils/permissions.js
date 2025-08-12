// utils/permissions.js - Permission checking utilities
import { CONFIG } from '../config/config.js';

// Check if user has founder permissions
// Only Founder
export function hasFounderPermission(member) {
  // console.log('Member roles:', member.roles.cache.map(r => r.id));
  // console.log('Founder roles:', CONFIG.ADMIN.FOUNDER);
  return CONFIG.ADMIN.FOUNDER.some(roleId => member.roles.cache.has(roleId));
}

// Check if user has admin permissions
// Only Admin
export function hasAdminPermission(member) {
  // console.log('Member roles:', member.roles.cache.map(r => r.id));
  // console.log('Admin roles:', CONFIG.ADMIN.ROLES);
  return member.permissions.has('Administrator') || 
  CONFIG.ADMIN.ROLES.some(roleId => member.roles.cache.has(roleId));
}


// Check if user has moderator permissions
// Admin & Moderator
export function hasModeratorPermission(member) {
  // console.log('Member roles:', member.roles.cache.map(r => r.id));
  // console.log('Moderator roles:', CONFIG.ADMIN.MODERATOR_ROLES);
  return hasAdminPermission(member) || 
  CONFIG.ADMIN.MODERATOR_ROLES.some(roleId => member.roles.cache.has(roleId));
}

// Check if command is in founder channel
export function isFounderChannel(channelId) {
  return CONFIG.CHANNELS.FOUNDER.includes(channelId);
}

// Check if command is in admin channel
export function isAdminChannel(channelId) {
  return channelId === CONFIG.CHANNELS.FITUR_ADMIN;
}

// Check if command is in role channel
export function isRoleChannel(channelId) {
  return channelId === CONFIG.CHANNELS.ADD_ROLE;
}

// Check if command is in user level channel
export function isUserLevelChannel(channelId) {
  // console.log('[DEBUG] Current channel:', channelId);
  // console.log('[DEBUG] Allowed channel:', CONFIG.CHANNELS.USER_LEVEL);
  return channelId === CONFIG.CHANNELS.USER_LEVEL;
}

// Check role management permissions
export function hasRolePermission(member, requiredLevel) {
  // Server administrators can do everything
  if (member.permissions.has('Administrator')) return true;
  
  // Admin role members can manage all roles
  if (CONFIG.ROLE_MANAGEMENT.ADMINS.some(roleName => 
    member.roles.cache.find(r => r.name === roleName))) {
    return true;
  }
  
  // Moderator role members can only manage moderator-level roles
  if (requiredLevel === 'moderator' && CONFIG.ROLE_MANAGEMENT.MODERATORS.some(roleName => 
    member.roles.cache.find(r => r.name === roleName))) {
    return true;
  }
  
  return false;
}