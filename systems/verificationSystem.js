// systems/verificationSystem.js - Member verification system
import { EmbedBuilder, ChannelType } from 'discord.js';
import { CONFIG } from '../config/config.js';

let verifyMessageId = null;

// Setup verification message
export async function setupVerificationMessage(guild) {
  const channel = guild.channels.cache.get(CONFIG.CHANNELS.USER_LOG);
  if (!channel || channel.type !== ChannelType.GuildText) return;

  const totalMembers = guild.memberCount;
  const verifiedCount = guild.members.cache.filter(m => m.roles.cache.has(CONFIG.ROLES.VERIFIED)).size;

  const embed = new EmbedBuilder()
    .setColor('#ff9900')
    .setTitle('🔒 Verifikasi Member')
    .setDescription(`🏠 **Total Member:** ${totalMembers}\n✅ **Terverifikasi:** ${verifiedCount}\n\n**Klik emoji ${CONFIG.EMOJIS.VERIFY} di bawah untuk verifikasi!**`)
    .setFooter({ text: 'Klik emoji untuk mendapatkan akses penuh ke server' });

  const message = await channel.send({ embeds: [embed] });
  await message.react(CONFIG.EMOJIS.VERIFY);
  verifyMessageId = message.id;
  return message.id;
}

// Update verification embed
export async function updateVerificationEmbed(guild) {
  const channel = guild.channels.cache.get(CONFIG.CHANNELS.USER_LOG);
  if (!channel) return;
  
  const message = await channel.messages.fetch(verifyMessageId).catch(() => {});
  if (!message) return;

  const totalMembers = guild.memberCount;
  const verifiedCount = guild.members.cache.filter(m => m.roles.cache.has(CONFIG.ROLES.VERIFIED)).size;

  const embed = new EmbedBuilder()
    .setColor('#ff9900')
    .setTitle('🔒 Verifikasi Member')
    .setDescription(`🏠 **Total Member:** ${totalMembers}\n✅ **Terverifikasi:** ${verifiedCount}`)
    .setFooter({ text: 'Klik emoji untuk mendapatkan akses penuh ke server' });

  await message.edit({ embeds: [embed] });
}

export { verifyMessageId };