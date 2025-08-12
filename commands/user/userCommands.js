// commands/userCommands.js - User accessible commands
import { EmbedBuilder } from 'discord.js';
import { CONFIG } from '../../config/config.js';
import { getUserData, getXPForLevel } from '../../systems/xpSystem.js';
import { User } from '../../database/models.js';
import { isUserLevelChannel, hasAdminPermission } from '../../utils/permissions.js';

export async function handleUserCommands(message, command, args) {
if ((command === 'profile' || command === 'leaderboard' || command === 'levelhelp') && !isUserLevelChannel(message.channel.id)) {
  return message.reply(`⛔ Command ini hanya bisa digunakan di channel <#${CONFIG.CHANNELS.USER_LEVEL}>`);
}
  // Profile/Level command
  if (command === 'profile') {
    const targetUser = message.mentions.users.first() || message.author;
    const data = await getUserData(targetUser.id);
    const nextLevelXP = getXPForLevel(data.level + 1);
    const currentLevelXP = getXPForLevel(data.level);
    const progress = data.xp - currentLevelXP;
    const needed = nextLevelXP - currentLevelXP;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📊 ${targetUser.username}'s Profile`)
      .addFields(
        { name: '🎯 Level', value: `${data.level}`, inline: true },
        { name: '💎 XP', value: `${data.xp}`, inline: true },
        { name: '📈 Progress', value: `${progress}/${needed} XP`, inline: true },
        { name: '💬 Messages', value: `${data.totalMessages}`, inline: true },
        { name: '🎤 Voice Time', value: `${Math.floor(data.voiceTime / 60000)} minutes`, inline: true }
      );
    await message.reply({ embeds: [embed] });
  }

  // Leaderboard command
  if (command === 'leaderboard') {
    const topUsers = await User.find().sort({ xp: -1 }).limit(10);
    let desc = '';
    
    for (let i = 0; i < topUsers.length; i++) {
      const u = topUsers[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const member = message.client.users.cache.get(u.userId);
      if (member) {
        desc += `${medal} **${member.username}** - Level ${u.level} (${u.xp} XP)\n`;
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#ffd700')
      .setTitle('🏆 Leaderboard')
      .setDescription(desc || 'No data yet');
    await message.reply({ embeds: [embed] });
  }

  if(command === 'levelhelp') {
    if (!hasAdminPermission(message.member)) {
      return message.reply('❌ You need admin permissions to use this command!');
    }
    const embed = new EmbedBuilder()
      .setColor('#ff1100')
      .setTitle('🔧 User Level Commands')
      .setDescription(`All user level commands must be used in ${CONFIG.CHANNELS.USER_LEVEL}`)
      .addFields(
        { name: '👑 Admin Only', value: '`!profile` - Check Leveling\n`!leaderboard` – Top 1 Leveling.', inline: false },
      )
      .setFooter({ text: 'Admin commands require appropriate permissions and must be used in admin channel' });

    await message.reply({ embeds: [embed] });
  }

}