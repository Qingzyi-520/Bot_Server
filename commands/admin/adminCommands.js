// commands/adminCommands.js - Admin-only commands
import { EmbedBuilder } from 'discord.js';
import { CONFIG } from '../../config/config.js';
import { hasFounderPermission, hasAdminPermission, isAdminChannel } from '../../utils/permissions.js';
import { getUserData, addXP, calculateLevel } from '../../systems/xpSystem.js';
import { checkRoleRewards } from '../../systems/levelSystem.js';
import { formatUptime } from '../../utils/helpers.js';
import { logAdminAction } from '../../utils/logging.js';
import { User, AdminLog } from '../../database/models.js';

export async function handleAdminCommands(message, command, args) {
  // Check if command is in admin channel
  if (!isAdminChannel(message.channel.id)) {
    return message.reply(`❌ Admin commands can only be used in <#${CONFIG.CHANNELS.FITUR_ADMIN}>!`);
  }

  // Check if command is admin
  if (!hasAdminPermission(message.member)) {
  return message.reply('❌ You need admin permissions to use this command!');
  }

  // Check if command has a administartor
  if (!message.member.permissions.has('Administrator')) {
  return message.reply('❌ Only server administrators can clear all logs!');
  }

    // ALL COMMAND AT HERE
    // Set XP command
    if (command === 'setxp') {
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[2]);
        
        if (!targetUser || isNaN(amount)) {
        return message.reply('Usage: `!setxp @user <amount>`');
        }
        
        const user = await getUserData(targetUser.id);
        const oldLevel = user.level;
        user.xp = Math.max(0, amount);
        user.level = calculateLevel(user.xp);
        await user.save();
        
        if (user.level !== oldLevel) {
        await checkRoleRewards(message.guild.members.cache.get(targetUser.id), user.level);
        }
        
        await logAdminAction('SET_XP', message.author.id, targetUser.id, `Set XP to ${amount}`);
        
        const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ XP Updated')
        .setDescription(`Set ${targetUser.username}'s XP to **${amount}** (Level ${user.level})`);
        
        await message.reply({ embeds: [embed] });
    }

    // Add XP command
    if (command === 'addxp') {        
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[2]);
        
        if (!targetUser || isNaN(amount)) {
        return message.reply('Usage: `!addxp @user <amount>`');
        }
        
        const user = await addXP(targetUser.id, amount);
        await logAdminAction('ADD_XP', message.author.id, targetUser.id, `Added ${amount} XP`);
        
        const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ XP Added')
        .setDescription(`Added **${amount} XP** to ${targetUser.username} (Total: ${user.xp} XP, Level ${user.level})`);
        
        await message.reply({ embeds: [embed] });
    }

    // Remove XP command
    if (command === 'removexp') {        
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[2]);
        
        if (!targetUser || isNaN(amount)) {
        return message.reply('Usage: `!removexp @user <amount>`');
        }
        
        const user = await getUserData(targetUser.id);
        user.xp = Math.max(0, user.xp - amount);
        user.level = calculateLevel(user.xp);
        await user.save();
        
        await logAdminAction('REMOVE_XP', message.author.id, targetUser.id, `Removed ${amount} XP`);
        
        const embed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle('✅ XP Removed')
        .setDescription(`Removed **${amount} XP** from ${targetUser.username} (Remaining: ${user.xp} XP, Level ${user.level})`);
        
        await message.reply({ embeds: [embed] });
    }

    // Reset user command
    if (command === 'resetuser') {
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
        return message.reply('Usage: `!resetuser @user`');
    }

    await User.findOneAndUpdate(
        { userId: targetUser.id },
        { 
        xp: 0, 
        level: 0, 
        totalMessages: 0, 
        voiceTime: 0,
        lastDaily: 0
        },
        { upsert: true }
    );

    await logAdminAction('RESET_USER', message.author.id, targetUser.id, 'Reset all user data');

    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('✅ User Reset')
        .setDescription(`Reset all data for ${targetUser.username}`);

    await message.reply({ embeds: [embed] });
    }

    // Bulkxp command
    if (command === 'bulkxp') {  
    const roleKey = args[1]?.toLowerCase();  // arg kedua: key role, misal 'moderator'
    const amount = parseInt(args[2]);
    
    if (!roleKey || isNaN(amount)) {
        return message.reply('Usage: `!bulkxp <role> <xpAmount>`\nExample: `!bulkxp moderator 100`');
    }
    
    const roleInfo = CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES[roleKey];
    if (!roleInfo) {
        return message.reply(`❌ Role '${roleKey}' tidak ditemukan di daftar manageable roles.`);
    }
    
    const role = message.guild.roles.cache.get(roleInfo.id);
    if (!role) {
        return message.reply(`❌ Role dengan ID ${roleInfo.id} tidak ditemukan di server.`);
    }
    
    // Cek apakah user punya level akses untuk role ini, misal level admin
    // Optional: bisa kamu tambahkan cek hak akses dari level user
    
    const members = role.members;
    let processed = 0;
    
    for (const [memberId, member] of members) {
        if (!member.user.bot) {
        await addXP(memberId, amount);
        processed++;
        }
    }
    
    await logAdminAction('BULK_XP', message.author.id, null, `Added ${amount} XP to ${processed} members with role ${role.name}`);
    
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Bulk XP Applied')
        .setDescription(`Added **${amount} XP** to **${processed} members** with role **${role.name}**`);
    
    await message.reply({ embeds: [embed] });
    }

    // XP Configuration commands
    if (command === 'xpconfig') {    
      const subCommand = args[1]?.toLowerCase();
      
      if (subCommand === 'show') {
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('⚙️ XP Configuration')
          .addFields(
            { name: '💬 Message XP', value: `${CONFIG.XP.MESSAGE.min}-${CONFIG.XP.MESSAGE.max} (Cooldown: ${CONFIG.XP.MESSAGE.cooldown/1000}s)`, inline: true },
            { name: '👍 Reaction Give', value: `${CONFIG.XP.REACTION_GIVE} XP`, inline: true },
            { name: '📨 Reaction Receive', value: `${CONFIG.XP.REACTION_RECEIVE} XP`, inline: true },
            { name: '🎤 Voice Per Minute', value: `${CONFIG.XP.VOICE_PER_MINUTE} XP`, inline: true },
            { name: '🎁 Daily Bonus', value: `${CONFIG.XP.DAILY_BONUS} XP`, inline: true },
            { name: '📧 Invite Bonus', value: `${CONFIG.XP.INVITE_BONUS} XP`, inline: true }
          );
        
        return message.reply({ embeds: [embed] });
      }
      
      return message.reply('Usage: `!xpconfig show`');
    }

    // Clear leaderboard (dangerous command)
    if (command === 'clearleaderboard') {   
    if (args[1] !== 'CONFIRM') {
        const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⚠️ Dangerous Command')
        .setDescription('This will **permanently delete ALL user data**!\n\nTo confirm, use: `!clearleaderboard CONFIRM`');
        
        return message.reply({ embeds: [embed] });
    }
    
    const deletedCount = await User.deleteMany({});
    await logAdminAction('CLEAR_LEADERBOARD', message.author.id, null, `Deleted ${deletedCount.deletedCount} user records`);
    
    const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🗑️ Leaderboard Cleared')
        .setDescription(`Deleted **${deletedCount.deletedCount}** user records`);
    
    await message.reply({ embeds: [embed] });
    }

    // Announcement command
    if (command === 'announce') { 
      const channelId = args[1];
      const announceText = args.slice(2).join(' ');
      
      if (!channelId || !announceText) {
        return message.reply('Usage: `!announce <channelId> <message>`');
      }
      
      const channel = message.guild.channels.cache.get(channelId);
      if (!channel) {
        return message.reply('❌ Channel not found!');
      }
      
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('📢 Announcement')
        .setDescription(announceText)
        .setFooter({ text: `By ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();
      
      await channel.send({ embeds: [embed] });
      await logAdminAction('ANNOUNCEMENT', message.author.id, null, `Announced to #${channel.name}: ${announceText.slice(0, 100)}...`);
      await message.reply('✅ Announcement sent!');
    }

    // Server statistics command
    if (command === 'serverstats') {      
        const totalUsers = await User.countDocuments();
        const totalXP = await User.aggregate([
        { $group: { _id: null, total: { $sum: '$xp' } } }
        ]);
        const totalMessages = await User.aggregate([
        { $group: { _id: null, total: { $sum: '$totalMessages' } } }
        ]);
        const avgLevel = await User.aggregate([
        { $group: { _id: null, avg: { $avg: '$level' } } }
        ]);
        
        const guild = message.guild;
        const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📊 Server Statistics')
        .addFields(
            { name: '👥 Total Members', value: `${guild.memberCount}`, inline: true },
            { name: '📝 Registered Users', value: `${totalUsers}`, inline: true },
            { name: '💎 Total XP', value: `${totalXP[0]?.total || 0}`, inline: true },
            { name: '💬 Total Messages', value: `${totalMessages[0]?.total || 0}`, inline: true },
            { name: '📈 Average Level', value: `${(avgLevel[0]?.avg || 0).toFixed(1)}`, inline: true },
            { name: '🤖 Bot Uptime', value: formatUptime(process.uptime()), inline: true }
        )
        .setThumbnail(guild.iconURL())
        .setTimestamp();
        
        await message.reply({ embeds: [embed] });
    }

    // User lookup with detailed info
    if (command === 'lookup') {       
      const targetUser = message.mentions.users.first() || 
                        message.guild.members.cache.get(args[1])?.user ||
                        message.guild.members.cache.find(m => 
                          m.user.username.toLowerCase().includes(args[1]?.toLowerCase())
                        )?.user;
      
      if (!targetUser) {
        return message.reply('Usage: `!lookup @user` or `!lookup <userID>` or `!lookup <username>`');
      }
      
      const member = message.guild.members.cache.get(targetUser.id);
      const userData = await getUserData(targetUser.id);
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`🔍 User Lookup: ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: '👤 User ID', value: targetUser.id, inline: true },
          { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📥 Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'Not in server', inline: true },
          { name: '🎯 Level', value: `${userData.level}`, inline: true },
          { name: '💎 XP', value: `${userData.xp}`, inline: true },
          { name: '💬 Messages', value: `${userData.totalMessages}`, inline: true },
          { name: '🎤 Voice Time', value: `${Math.floor(userData.voiceTime / 60000)} minutes`, inline: true },
          { name: '🎁 Last Daily', value: userData.lastDaily ? `<t:${Math.floor(userData.lastDaily / 1000)}:R>` : 'Never', inline: true },
          { name: '🏷️ Roles', value: member ? member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.name).join(', ') || 'None' : 'Not in server', inline: false }
        )
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
    }

    // Admin help command
    if (command === 'adminhelp') {     
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔧 Admin Commands')
        .setDescription(`All admin commands must be used in <#${CONFIG.CHANNELS.FITUR_ADMIN}>`)
        .addFields(
          { name: '👑 Admin', value: '`!setxp @user <amount>` - Menetapkan XP tertentu untuk user.\n`!addxp @user <amount>` – Menambahkan XP ke user.\n`!removexp @user <amount>` – Mengurangi XP user.\n`!resetuser @user` – Mereset data XP user.\n`!bulkxp <role> <amount>` – Menambah XP massal untuk semua anggota dengan role tertentu.\n`!xpconfig show` – Menampilkan konfigurasi XP saat ini.\n`!clearleaderboard CONFIRM` – Menghapus seluruh data leaderboard XP.\n`!announce <channelId> <message>` – Mengirim pengumuman ke channel tertentu.\n `!serverstats` – Menampilkan statistik server.\n`!lookup @user`  – Melihat detail data XP dan info user.', inline: false },
          { name: '💤 Founder Only', value: '`!adminlogs [limit]`  – Menampilkan log aktivitas admin.\n `!deletelog <logId>` — hapus 1 log berdasarkan _id (ObjectId).\n `!deletelast <n>` — hapus n log paling terbaru.\n `!clearlogs CONFIRM` — hapus semua log (warning).', inline: false },
          { name: '📝 Notes', value: '• Use user ID instead of mention if user is not in server\n• Bulk XP applies to all non-bot members with specified role\n• Clear leaderboard requires CONFIRM parameter\n• All actions are logged automatically', inline: false }
      )
      .setFooter({ text: 'Admin commands require appropriate permissions and must be used in admin channel' });

      await message.reply({ embeds: [embed] });
    }

    // View admin logs command
    // if (command === 'adminlogs') {      
    //   const limit = parseInt(args[1]) || 10;
    //   const logs = await AdminLog.find().sort({ timestamp: -1 }).limit(Math.min(limit, 50));
      
    //   if (logs.length === 0) {
    //     return message.reply('📝 No admin logs found.');
    //   }
      
    //   let description = '';
    //   for (const log of logs) {
    //     let admin = message.client.users.cache.get(log.adminId);
    //     if (!admin) {
    //       admin = await message.client.users.fetch(log.adminId).catch(() => null);
    //     }
    //     let target = null;
    //     if (log.targetId) {
    //       target = message.client.users.cache.get(log.targetId);
    //       if (!target) {
    //         target = await message.client.users.fetch(log.targetId).catch(() => null);
    //       }
    //     }
        
    //     description += `**${log.action}** by ${admin ? admin.username : log.adminId}\n`;
    //     if (target) description += `Target: ${target.username}\n`;
    //     description += `${log.details}\n<t:${Math.floor(log.timestamp.getTime() / 1000)}:R>\n\n`;
    //   }

    //   const embed = new EmbedBuilder()
    //     .setColor('#ff9900')
    //     .setTitle('📋 Admin Logs')
    //     .setDescription(description.slice(0, 4000))  // batasi supaya tidak overflow
    //     .setFooter({ text: `Showing ${logs.length} most recent logs` });

    //   await message.reply({ embeds: [embed] });
    // }

    // Delete single log by ID
    // if (command === 'deletelog') {
    //   // Check if command is FOUNDER
    //   if (!hasFounderPermission(message.member)) {
    //   return message.reply('❌ You need founder permissions to use this command!');
    //   }
    //   const logId = args[1];
    //   if (!logId) return message.reply('Usage: `!deletelog <logId>`');

    //   try {
    //     const deleted = await AdminLog.findByIdAndDelete(logId).exec();
    //     if (!deleted) return message.reply(`❌ Log with ID \`${logId}\` not found.`);

    //     // reply with deleted log details
    //     const adminUser = await message.client.users.fetch(deleted.adminId).catch(() => null);
    //     const targetUser = deleted.targetId ? await message.client.users.fetch(deleted.targetId).catch(() => null) : null;

    //     const embed = new EmbedBuilder()
    //       .setColor('#ff0000')
    //       .setTitle('🗑️ Deleted Admin Log')
    //       .addFields(
    //         { name: 'Action', value: `${deleted.action}`, inline: true },
    //         { name: 'Admin', value: `${adminUser ? adminUser.tag : deleted.adminId}`, inline: true },
    //         { name: 'Target', value: `${targetUser ? targetUser.tag : (deleted.targetId || 'None')}`, inline: true },
    //         { name: 'Details', value: `${deleted.details || '—'}`, inline: false },
    //         { name: 'Timestamp', value: `<t:${Math.floor(new Date(deleted.timestamp).getTime() / 1000)}:F>`, inline: false }
    //       )
    //       .setFooter({ text: `Log ID: ${deleted._id}` });

    //     await logAdminAction('DELETE_LOG', message.author.id, deleted._id.toString(), `Deleted log ${deleted._id}`);
    //     return message.reply({ embeds: [embed] });
    //   } catch (err) {
    //     console.error('Error deleteLog:', err);
    //     return message.reply('❌ Terjadi error saat menghapus log.');
    //   }
    // }

    // Delete last N logs
    // if (command === 'deletelast') {
    //   // Check if command is FOUNDER
    //   if (!hasFounderPermission(message.member)) {
    //   return message.reply('❌ You need founder permissions to use this command!');
    //   }

    //   const n = Math.min(Math.max(parseInt(args[1]) || 0, 1), 100); // batas min 1, max 100
    //   if (isNaN(n) || n < 1) return message.reply('Usage: `!deletelast <n>` (n antara 1-100)');

    //   try {
    //     const logsToDelete = await AdminLog.find().sort({ timestamp: -1 }).limit(n).select('_id action adminId details timestamp').exec();
    //     if (!logsToDelete.length) return message.reply('📝 No logs to delete.');

    //     const ids = logsToDelete.map(l => l._id);
    //     const res = await AdminLog.deleteMany({ _id: { $in: ids } }).exec();

    //     await logAdminAction('DELETE_LAST_LOGS', message.author.id, null, `Deleted ${res.deletedCount} most recent logs`);
    //     return message.reply(`✅ Deleted ${res.deletedCount} most recent logs.`);
    //   } catch (err) {
    //     console.error('Error deletelast:', err);
    //     return message.reply('❌ Terjadi error saat menghapus logs.');
    //   }
    // }

    // Clear all logs (dangerous)
    // if (command === 'clearlogs') {
    //   // Check if command is FOUNDER
    //   if (!hasFounderPermission(message.member)) {
    //   return message.reply('❌ You need founder permissions to use this command!');
    //   }

    //   if (args[1] !== 'CONFIRM') {
    //     const embed = new EmbedBuilder()
    //       .setColor('#ff0000')
    //       .setTitle('⚠️ Dangerous Command: Clear All Admin Logs')
    //       .setDescription('This will **permanently delete ALL admin logs** from the database!\nTo confirm, run: `!clearlogs CONFIRM`');
    //     return message.reply({ embeds: [embed] });
    //   }

    //   try {
    //     const deleted = await AdminLog.deleteMany({}).exec();
    //     await logAdminAction('CLEAR_ADMIN_LOGS', message.author.id, null, `Deleted ${deleted.deletedCount} admin log records`);
    //     return message.reply(`🗑️ Cleared all admin logs (${deleted.deletedCount} records).`);
    //   } catch (err) {
    //     console.error('Error clearlogs:', err);
    //     return message.reply('❌ Terjadi error saat menghapus semua logs.');
    //   }
    // }

}