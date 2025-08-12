// utils/helpers.js - General utility functions

// Format uptime in readable format
export function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let uptime = '';
  if (days > 0) uptime += `${days}d `;
  if (hours > 0) uptime += `${hours}h `;
  uptime += `${minutes}m`;
  
  return uptime;
}

// Find user by various methods
export function findUser(guild, identifier) {
  // Try to get by mention
  const mentionMatch = identifier.match(/^<@!?(\d+)>$/);
  if (mentionMatch) {
    return guild.members.cache.get(mentionMatch[1]);
  }
  
  // Try to get by user ID
  if (/^\d+$/.test(identifier)) {
    return guild.members.cache.get(identifier);
  }
  
  // Try to get by username
  return guild.members.cache.find(member => 
    member.user.username.toLowerCase() === identifier.toLowerCase() ||
    member.displayName.toLowerCase() === identifier.toLowerCase()
  );
}

// Generate random XP within range
export function getRandomXP(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}