// commands\founder\founderCommands.js - all command founder
import { EmbedBuilder } from 'discord.js';
import { CONFIG } from '../../config/config.js';
import { hasFounderPermission, isFounderChannel } from '../../utils/permissions.js';
import { logAdminAction } from '../../utils/logging.js';
import { AdminLog } from '../../database/models.js';

export async function handleFounderCommands(message, command, args) {
    // Check if command is in founder channel
    if (!isFounderChannel(message.channel.id)) {
        return message.reply(`❌ Founder commands can only be used in <#${CONFIG.CHANNELS.FITUR_ADMIN}>!`);
    }

    // Check if command is FOUNDER
    if (!hasFounderPermission(message.member)) {
    return message.reply('❌ You need founder permissions to use this command!');
    }

    // ALL COMMAND AT HERE
    // View admin logs command
    if (command === 'adminlogs') {      
      const limit = parseInt(args[1]) || 10;
      const logs = await AdminLog.find().sort({ timestamp: -1 }).limit(Math.min(limit, 50));
      
      if (logs.length === 0) {
        return message.reply('📝 No admin logs found.');
      }
      
      let description = '';
      for (const log of logs) {
        let admin = message.client.users.cache.get(log.adminId);
        if (!admin) {
          admin = await message.client.users.fetch(log.adminId).catch(() => null);
        }
        let target = null;
        if (log.targetId) {
          target = message.client.users.cache.get(log.targetId);
          if (!target) {
            target = await message.client.users.fetch(log.targetId).catch(() => null);
          }
        }
        
        description += `**${log.action}** by ${admin ? admin.username : log.adminId}\n`;
        if (target) description += `Target: ${target.username}\n`;
        description += `${log.details}\n<t:${Math.floor(log.timestamp.getTime() / 1000)}:R>\n\n`;
      }

      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('📋 Admin Logs')
        .setDescription(description.slice(0, 4000))  // batasi supaya tidak overflow
        .setFooter({ text: `Showing ${logs.length} most recent logs` });

      await message.reply({ embeds: [embed] });
    }

    // Delete single log by ID
    if (command === 'deletelog') {
      const logId = args[1];
      if (!logId) return message.reply('Usage: `!deletelog <logId>`');

      try {
        const deleted = await AdminLog.findByIdAndDelete(logId).exec();
        if (!deleted) return message.reply(`❌ Log with ID \`${logId}\` not found.`);

        // reply with deleted log details
        const adminUser = await message.client.users.fetch(deleted.adminId).catch(() => null);
        const targetUser = deleted.targetId ? await message.client.users.fetch(deleted.targetId).catch(() => null) : null;

        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🗑️ Deleted Admin Log')
          .addFields(
            { name: 'Action', value: `${deleted.action}`, inline: true },
            { name: 'Admin', value: `${adminUser ? adminUser.tag : deleted.adminId}`, inline: true },
            { name: 'Target', value: `${targetUser ? targetUser.tag : (deleted.targetId || 'None')}`, inline: true },
            { name: 'Details', value: `${deleted.details || '—'}`, inline: false },
            { name: 'Timestamp', value: `<t:${Math.floor(new Date(deleted.timestamp).getTime() / 1000)}:F>`, inline: false }
          )
          .setFooter({ text: `Log ID: ${deleted._id}` });

        await logAdminAction('DELETE_LOG', message.author.id, deleted._id.toString(), `Deleted log ${deleted._id}`);
        return message.reply({ embeds: [embed] });
      } catch (err) {
        console.error('Error deleteLog:', err);
        return message.reply('❌ Terjadi error saat menghapus log.');
      }
    }

    // Delete last N logs
    if (command === 'deletelast') {
      const n = Math.min(Math.max(parseInt(args[1]) || 0, 1), 100); // batas min 1, max 100
      if (isNaN(n) || n < 1) return message.reply('Usage: `!deletelast <n>` (n antara 1-100)');

      try {
        const logsToDelete = await AdminLog.find().sort({ timestamp: -1 }).limit(n).select('_id action adminId details timestamp').exec();
        if (!logsToDelete.length) return message.reply('📝 No logs to delete.');

        const ids = logsToDelete.map(l => l._id);
        const res = await AdminLog.deleteMany({ _id: { $in: ids } }).exec();

        await logAdminAction('DELETE_LAST_LOGS', message.author.id, null, `Deleted ${res.deletedCount} most recent logs`);
        return message.reply(`✅ Deleted ${res.deletedCount} most recent logs.`);
      } catch (err) {
        console.error('Error deletelast:', err);
        return message.reply('❌ Terjadi error saat menghapus logs.');
      }
    }

    // Clear all logs (dangerous)
    if (command === 'clearlogs') {
      if (args[1] !== 'CONFIRM') {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('⚠️ Dangerous Command: Clear All Admin Logs')
          .setDescription('This will **permanently delete ALL admin logs** from the database!\nTo confirm, run: `!clearlogs CONFIRM`');
        return message.reply({ embeds: [embed] });
      }

      try {
        const deleted = await AdminLog.deleteMany({}).exec();
        await logAdminAction('CLEAR_ADMIN_LOGS', message.author.id, null, `Deleted ${deleted.deletedCount} admin log records`);
        return message.reply(`🗑️ Cleared all admin logs (${deleted.deletedCount} records).`);
      } catch (err) {
        console.error('Error clearlogs:', err);
        return message.reply('❌ Terjadi error saat menghapus semua logs.');
      }
    }

}