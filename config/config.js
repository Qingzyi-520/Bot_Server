// config/config.js - All configuration settings
import 'dotenv/config';

// Fungsi validasi env
function requireEnv(key) {
  if (!process.env[key] || process.env[key].trim() === '') {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return process.env[key];
}

// ====== VALIDASI ENV WAJIB ======
[
  'TOKEN',
  'MONGO_URI',
  'GUILD_ID',
  'CHANNEL_FOUNDER',
  'CHANNEL_USER_LOG',
  'CHANNEL_USER_LEVEL',
  'CHANNEL_FITUR_ADMIN',
  'CHANNEL_ADD_ROLE',
  'CHANNEL_FITUR_MODERATOR',
  'ROLE_ADMIN',
  'ROLE_MODERATOR',
  'ROLE_VERIFIED',
  'ADMIN_FOUNDER',
  'ADMIN_ROLES',
  'ADMIN_MODERATOR_ROLES',
  'MANAGEABLE_ROLES_founder',
  'MANAGEABLE_ROLES_admin',
  'MANAGEABLE_ROLES_moderator',
  'MANAGEABLE_ROLES_modeler',
  'MANAGEABLE_ROLES_animator',
  'MANAGEABLE_ROLES_roblox'
].forEach(requireEnv);

// ====== CONFIG EXPORT ======
export const CONFIG = {
  // Server IDs
  GUILD_ID: requireEnv('GUILD_ID'),

  // Channel IDs
  CHANNELS: {
    FOUNDER: requireEnv('CHANNEL_FOUNDER').split(','),
    USER_LOG: requireEnv('CHANNEL_USER_LOG'),
    USER_LEVEL: requireEnv('CHANNEL_USER_LEVEL'),
    FITUR_ADMIN: requireEnv('CHANNEL_FITUR_ADMIN'),
    ADD_ROLE: requireEnv('CHANNEL_ADD_ROLE'),
    FITUR_MODERATOR: requireEnv('CHANNEL_FITUR_MODERATOR'),
  },

  // Role IDs
  ROLES: {
    ADMIN: requireEnv('ROLE_ADMIN'),
    MODERATOR: requireEnv('ROLE_MODERATOR'),
    VERIFIED: requireEnv('ROLE_VERIFIED'),
  },

  // Emojis
  EMOJIS: {
    VERIFY: '✅'
  },

  // XP Configuration
  XP: {
    MESSAGE: { min: 15, max: 25, cooldown: 60000 },
    REACTION_GIVE: 5,
    REACTION_RECEIVE: 3,
    VOICE_PER_MINUTE: 10,
    DAILY_BONUS: 100,
    INVITE_BONUS: 500
  },

  // Level Roles
  LEVEL_ROLES: {
    1: { id: requireEnv('ROLE_VERIFIED'), name: 'Verified', xp: 0 },
    5: { id: null, name: 'Active Member', xp: 250 },
    10: { id: null, name: 'Trusted Member', xp: 1000 },
    15: { id: null, name: 'Veteran', xp: 2500 },
    20: { id: null, name: 'Elite Member', xp: 5000 },
    25: { id: null, name: 'Legend', xp: 10000 }
  },

  // Admin Configuration
  ADMIN: {
    FOUNDER: requireEnv('ADMIN_FOUNDER').split(','),
    ROLES: requireEnv('ADMIN_ROLES').split(','),
    MODERATOR_ROLES: requireEnv('ADMIN_MODERATOR_ROLES').split(',')
  },

  // Role Management Configuration
  ROLE_MANAGEMENT: {
    FOUNDER: ['Founder'],
    ADMINS: ['Admin'],
    MODERATORS: ['Moderator'],
    MANAGEABLE_ROLES: {
      founder: { id: requireEnv('MANAGEABLE_ROLES_founder'), name: 'Founder', level: ['founder'] },
      admin: { id: requireEnv('MANAGEABLE_ROLES_admin'), name: 'Admin', level: ['founder', 'admin'] },
      moderator: { id: requireEnv('MANAGEABLE_ROLES_moderator'), name: 'Moderator', level: ['founder', 'admin'] },
      modeler: { id: requireEnv('MANAGEABLE_ROLES_modeler'), name: 'Modeler', level: ['founder', 'admin', 'moderator'] },
      animator: { id: requireEnv('MANAGEABLE_ROLES_animator'), name: 'Animator', level: ['founder', 'admin', 'moderator'] },
      roblox: { id: requireEnv('MANAGEABLE_ROLES_roblox'), name: 'Roblox', level: ['founder', 'admin', 'moderator'] }
    }
  }
};
