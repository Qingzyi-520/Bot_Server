// systems/levelSystem.js - Level up handling and role rewards
import { EmbedBuilder } from 'discord.js';
import { CONFIG } from '../config/config.js';
import { getUserData } from './xpSystem.js';

// Handle level up
export async function handleLevelUp(userId, newLevel, oldLevel) {
  const { client } = await import('../index.js');
  const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
  if (!guild) return;
  
  const member = guild.members.cache.get(userId);
  if (!member) return;
  
  const channel = guild.channels.cache.get(CONFIG.CHANNELS.USER_LEVEL);
  if (!channel) return;

  const levelEmbed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🎉 Level Up!')
    .setDescription(`${member} reached **Level ${newLevel}**!`)
    .addFields(
      { name: '📈 Previous Level', value: `${oldLevel}`, inline: true },
      { name: '🆙 New Level', value: `${newLevel}`, inline: true },
      { name: '💎 Total XP', value: `${(await getUserData(userId)).xp}`, inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  await channel.send({ embeds: [levelEmbed] });
  await checkRoleRewards(member, newLevel);
}

// Check and assign role rewards
export async function checkRoleRewards(member, level) {
  for (const [levelReq, roleData] of Object.entries(CONFIG.LEVEL_ROLES)) {
    if (level >= parseInt(levelReq) && roleData.id) {
      const role = member.guild.roles.cache.get(roleData.id);
      if (role && !member.roles.cache.has(roleData.id)) {
        await member.roles.add(role).catch(console.error);
      }
    }
  }
}