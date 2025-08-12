// events/messageEvents.js - Message-related event handlers
import { CONFIG } from '../config/config.js';
import { addXP } from '../systems/xpSystem.js';
import { getRandomXP } from '../utils/helpers.js';
import { handleUserCommands } from '../commands/user/userCommands.js';
import { handleAdminCommands } from '../commands/admin/adminCommands.js';
import { handleRoleCommands } from '../commands/admin/roleCommands.js';
import { handleFounderCommands } from '../commands/founder/founderCommands.js'

let messageCooldowns = new Map();

export function handleMessageEvents(client) {
  // Handle message XP and commands
  client.on('messageCreate', async (message) => {
    if (message.author.bot || message.guild?.id !== CONFIG.GUILD_ID) return;

    // Handle XP for non-command messages
    if (!message.content.startsWith('!')) {
      const userId = message.author.id;
      const now = Date.now();
      
      // Check cooldown
      if (messageCooldowns.has(userId) && now < messageCooldowns.get(userId) + CONFIG.XP.MESSAGE.cooldown) {
        return;
      }
      
      messageCooldowns.set(userId, now);

      // Add XP
      const xpGain = getRandomXP(CONFIG.XP.MESSAGE.min, CONFIG.XP.MESSAGE.max);
      const user = await addXP(userId, xpGain);
      user.totalMessages++;
      await user.save();

      // Clean up cooldown
      setTimeout(() => messageCooldowns.delete(userId), CONFIG.XP.MESSAGE.cooldown);
      return;
    }

    // Handle commands
    const args = message.content.slice(1).split(' ');
    const command = args[0].toLowerCase();

    // User commands (work in any channel)
    if (['profile', 'leaderboard', 'levelhelp'].includes(command)) {
      await handleUserCommands(message, command, args);
      return;
    }

    // Founder commands (all channel ex admin moderator)
    const founderCommands = ['adminlogs','deletelog','deletelast','clearlogs'];
    if (founderCommands.includes(command)) {
      await handleFounderCommands(message, command, args);
      return;
    }

    // Admin commands (only in fitur_admin channel)
    const adminCommands = ['setxp', 'addxp', 'removexp', 'resetuser', 'bulkxp', 'xpconfig', 
                          'clearleaderboard', 'announce', 'serverstats', 'lookup', 
                          'adminhelp'];
    if (adminCommands.includes(command)) {
      await handleAdminCommands(message, command, args);
      return;
    }

    // Role commands (only in add_role channel)
    const roleCommands = ['addrole', 'removerole', 'changerole', 'roles', 'userroles', 
                         'rolelist', 'rolehelp', 'rolelogs'];
    if (roleCommands.includes(command)) {
      await handleRoleCommands(message, command, args);
      return;
    }
  });
}