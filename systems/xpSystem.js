// systems/xpSystem.js - XP calculation and management
import { User } from '../database/models.js';
import { CONFIG } from '../config/config.js';
import { handleLevelUp } from './levelSystem.js';

// Get or create user data
export async function getUserData(userId) {
  const user = await User.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { new: true, upsert: true }
  );
  return user;
}

// Calculate level from XP
export function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

// Calculate XP required for specific level
export function getXPForLevel(level) {
  return Math.pow(level / 0.1, 2);
}

// Add XP to user
export async function addXP(userId, amount) {
  const user = await getUserData(userId);
  const oldLevel = user.level;

  user.xp += amount;
  user.level = calculateLevel(user.xp);
  await user.save();

  if (user.level > oldLevel) {
    await handleLevelUp(userId, user.level, oldLevel);
  }
  return user;
}

// Check and apply daily bonuses
export async function checkDailyBonuses(client) {
  const now = Date.now();
  const oneDayAgo = now - 86400000;
  const users = await User.find({ lastDaily: { $lt: oneDayAgo } });

  for (const user of users) {
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    const member = guild?.members.cache.get(user.userId);
    if (member && member.presence?.status !== 'offline') {
      user.lastDaily = now;
      user.xp += CONFIG.XP.DAILY_BONUS;
      user.level = calculateLevel(user.xp);
      await user.save();
    }
  }
}