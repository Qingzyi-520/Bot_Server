// events/reactionEvents.js - Reaction event handlers
import { CONFIG } from '../config/config.js';
import { addXP } from '../systems/xpSystem.js';
import { updateVerificationEmbed, verifyMessageId } from '../systems/verificationSystem.js';

export function handleReactionEvents(client) {
  // Handle reaction add
  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || reaction.message.guild?.id !== CONFIG.GUILD_ID) return;
    if (reaction.partial) await reaction.fetch().catch(() => {});

    // Handle verification
    if (reaction.message.id === verifyMessageId && reaction.emoji.name === CONFIG.EMOJIS.VERIFY) {
      const member = reaction.message.guild.members.cache.get(user.id);
      if (!member.roles.cache.has(CONFIG.ROLES.VERIFIED)) {
        await member.roles.add(CONFIG.ROLES.VERIFIED).catch(console.error);
        await addXP(user.id, 100);
        await updateVerificationEmbed(reaction.message.guild);
      }
      return;
    }

    // Add XP for giving reactions
    await addXP(user.id, CONFIG.XP.REACTION_GIVE);
    
    // Add XP for receiving reactions
    if (reaction.message.author && !reaction.message.author.bot) {
      await addXP(reaction.message.author.id, CONFIG.XP.REACTION_RECEIVE);
    }
  });

  // Handle reaction remove
  client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    
    // Handle verification removal
    if (reaction.message.id === verifyMessageId && reaction.emoji.name === CONFIG.EMOJIS.VERIFY) {
      const member = reaction.message.guild.members.cache.get(user.id);
      if (member.roles.cache.has(CONFIG.ROLES.VERIFIED)) {
        await member.roles.remove(CONFIG.ROLES.VERIFIED).catch(console.error);
        await updateVerificationEmbed(reaction.message.guild);
      }
    }
  });
}