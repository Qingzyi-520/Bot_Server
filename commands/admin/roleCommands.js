// commands/roleCommands.js - Role management commands
// command untuk admin di channel add role admin

import { EmbedBuilder } from 'discord.js';
import { CONFIG } from '../../config/config.js';
import { hasFounderPermission,  hasRolePermission, isRoleChannel, hasAdminPermission } from '../../utils/permissions.js';
import { findUser } from '../../utils/helpers.js';
import { logRoleAction } from '../../utils/logging.js';
import { RoleLog } from '../../database/models.js';

export async function handleRoleCommands(message, command, args) {
  // Check if command is in role channel
  if (!isRoleChannel(message.channel.id)) {
    return message.reply(`❌ Role commands can only be used in <#${CONFIG.CHANNELS.ADD_ROLE}>!`);
  }

  // Check if command is admin
  if (!hasAdminPermission(message.member)) {
  return message.reply('❌ You need admin permissions to use this command!');
  }

  // ALL COMMAND AT HERE
  // Add role command (admin only)
  if (command === 'addrole') {
    const roleKey = args[1]?.toLowerCase();
    const userIdentifier = args.slice(2).join(' ');
    
    if (!roleKey || !userIdentifier) {
      return message.reply('Usage: `!addrole <role> @user`\n\nAvailable roles: ' + Object.keys(CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES).join(', '));
    }
    
    const roleConfig = CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES[roleKey];
    if (!roleConfig) {
      return message.reply('❌ Invalid role! Available roles: ' + Object.keys(CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES).join(', '));
    }
    
    if (!hasRolePermission(message.member, roleConfig.level)) {
      return message.reply(`❌ You don't have permission to manage the **${roleConfig.name}** role!`);
    }
    
    const targetMember = findUser(message.guild, userIdentifier);
    if (!targetMember) {
      return message.reply('❌ User not found! Try using @mention.');
    }
    
    const role = message.guild.roles.cache.get(roleConfig.id);
    if (!role) {
      return message.reply('❌ Role not found in server! Please check role configuration.');
    }
    
    if (targetMember.roles.cache.has(roleConfig.id)) {
      return message.reply(`❌ ${targetMember.user.username} already has the **${roleConfig.name}** role!`);
    }
    
    try {
      await targetMember.roles.add(role);
      await logRoleAction('ADD_ROLE', message.author.id, targetMember.id, `Added role: ${roleConfig.name}`);
      
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Role Added')
        .setDescription(`Successfully added **${roleConfig.name}** role to ${targetMember.user.username}`)
        .setThumbnail(targetMember.user.displayAvatarURL())
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error adding role:', error);
      await message.reply('❌ Failed to add role. Please check bot permissions.');
    }
  }

  // Remove role command (admin only)
  if (command === 'removerole') {
    const roleKey = args[1]?.toLowerCase();
    const userIdentifier = args.slice(2).join(' ');
    
    if (!roleKey || !userIdentifier) {
      return message.reply('Usage: `!removerole <role> @user`\n\nAvailable roles: ' + Object.keys(CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES).join(', '));
    }
    
    const roleConfig = CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES[roleKey];
    if (!roleConfig) {
      return message.reply('❌ Invalid role! Available roles: ' + Object.keys(CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES).join(', '));
    }
    
    if (!hasRolePermission(message.member, roleConfig.level)) {
      return message.reply(`❌ You don't have permission to manage the **${roleConfig.name}** role!`);
    }
    
    const targetMember = findUser(message.guild, userIdentifier);
    if (!targetMember) {
      return message.reply('❌ User not found! Try using @mention.');
    }
    
    const role = message.guild.roles.cache.get(roleConfig.id);
    if (!role) {
      return message.reply('❌ Role not found in server! Please check role configuration.');
    }
    
    if (!targetMember.roles.cache.has(roleConfig.id)) {
      return message.reply(`❌ ${targetMember.user.username} doesn't have the **${roleConfig.name}** role!`);
    }
    
    try {
      await targetMember.roles.remove(role);
      await logRoleAction('REMOVE_ROLE', message.author.id, targetMember.id, `Removed role: ${roleConfig.name}`);
      
      const embed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle('✅ Role Removed')
        .setDescription(`Successfully removed **${roleConfig.name}** role from ${targetMember.user.username}`)
        .setThumbnail(targetMember.user.displayAvatarURL())
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error removing role:', error);
      await message.reply('❌ Failed to remove role. Please check bot permissions.');
    }
  }

  // Change/Replace role command (admin only)
  if (command === 'changerole') {
    const oldRoleKey = args[1]?.toLowerCase();
    const newRoleKey = args[2]?.toLowerCase();
    const userIdentifier = args.slice(3).join(' ');
    
    if (!oldRoleKey || !newRoleKey || !userIdentifier) {
      return message.reply('Usage: `!changerole <old_role> <new_role> @user`\n\nAvailable roles: ' + Object.keys(CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES).join(', '));
    }
    
    const oldRoleConfig = CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES[oldRoleKey];
    const newRoleConfig = CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES[newRoleKey];
    
    if (!oldRoleConfig || !newRoleConfig) {
      return message.reply('❌ Invalid role! Available roles: ' + Object.keys(CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES).join(', '));
    }
    
    // Check permission for both roles
    if (!hasRolePermission(message.member, oldRoleConfig.level) || !hasRolePermission(message.member, newRoleConfig.level)) {
      return message.reply(`❌ You don't have permission to manage these roles!`);
    }
    
    const targetMember = findUser(message.guild, userIdentifier);
    if (!targetMember) {
      return message.reply('❌ User not found! Try using @mention.');
    }
    
    const oldRole = message.guild.roles.cache.get(oldRoleConfig.id);
    const newRole = message.guild.roles.cache.get(newRoleConfig.id);
    
    if (!oldRole || !newRole) {
      return message.reply('❌ One or both roles not found in server! Please check role configuration.');
    }
    
    if (!targetMember.roles.cache.has(oldRoleConfig.id)) {
      return message.reply(`❌ ${targetMember.user.username} doesn't have the **${oldRoleConfig.name}** role to replace!`);
    }
    
    if (targetMember.roles.cache.has(newRoleConfig.id)) {
      return message.reply(`❌ ${targetMember.user.username} already has the **${newRoleConfig.name}** role!`);
    }
    
    try {
      // Remove old role and add new role
      await targetMember.roles.remove(oldRole);
      await targetMember.roles.add(newRole);
      
      // Log the action
      await logRoleAction('CHANGE_ROLE', message.author.id, targetMember.id, `Changed role: ${oldRoleConfig.name} → ${newRoleConfig.name}`);
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('✅ Role Changed')
        .setDescription(`Successfully changed ${targetMember.user.username}'s role from **${oldRoleConfig.name}** to **${newRoleConfig.name}**`)
        .setThumbnail(targetMember.user.displayAvatarURL())
        .setTimestamp();
      
      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error changing role:', error);
      await message.reply('❌ Failed to change role. Please check bot permissions.');
    }
  }

  // List user's roles (admin only)
  if (command === 'roles' || command === 'userroles') {
    const userIdentifier = args.slice(1).join(' ') || message.author.id;
    
    const targetMember = findUser(message.guild, userIdentifier);
    if (!targetMember) {
      console.log(targetMember)
      return message.reply('❌ User not found! Try using @user.');
    }
    
    const userRoles = targetMember.roles.cache
      .filter(role => role.id !== message.guild.id) // Exclude @everyone
      .sort((a, b) => b.position - a.position)
      .map(role => role.name);
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🏷️ Roles for ${targetMember.user.username}`)
      .setDescription(userRoles.length > 0 ? userRoles.join('\n') : 'No roles')
      .setThumbnail(targetMember.user.displayAvatarURL())
      .addFields(
        { name: '📊 Total Roles', value: `${userRoles.length}`, inline: true },
        { name: '🎯 Highest Role', value: userRoles[0] || 'None', inline: true }
      )
      .setTimestamp();
    
    await message.reply({ embeds: [embed] });
  }

  // List manageable roles (admin only)
  if (command === 'rolelist') {
    let founderRoles = ''; 
    let adminRoles = '';
    let moderatorRoles = '';
    
    for (const [key, config] of Object.entries(CONFIG.ROLE_MANAGEMENT.MANAGEABLE_ROLES)) {
      const role = message.guild.roles.cache.get(config.id);
      const roleInfo = `\`${key}\` - ${config.name} ${role ? '✅' : '❌'}\n`;
      
    if (config.level.includes('founder')) {
      founderRoles += roleInfo;
    }
    if (config.level.includes('admin')) {
      adminRoles += roleInfo;
    }
    if (config.level.includes('moderator')) {
      moderatorRoles += roleInfo;
    }

    }
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📋 Manageable Roles')
      .addFields(
        { name: '💤 Founder Level Roles', value: founderRoles || 'None', inline: false },
        { name: '👑 Admin Level Roles', value: adminRoles || 'None', inline: false },
        { name: '🛡️ Moderator Level Roles', value: moderatorRoles || 'None', inline: false }
      );
    
    await message.reply({ embeds: [embed] });
  }

  // Role help command (admin only)
  if (command === 'rolehelp') {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🔧 Role Management Commands')
      .setDescription(`All role commands must be used in <#${CONFIG.CHANNELS.ADD_ROLE}>`)
      .addFields(
        { 
          name: '👑 Admin', 
          value: '`!addrole <role> <user>` - Add role to user\n`!removerole <role> <user>` - Remove role from user\n`!changerole <old> <new> <user>` - Replace user\'s role\n`!roles [user] || !userroles` - Show user\'s roles\n`!rolelist` - Show all manageable roles', 
          inline: false 
        },
                { 
          name: '💤 Founder', 
          value: '`!rolelogs [limit]` – Lihat log aktivitas role.', 
          inline: false 
        },
        { 
          name: '👤 User Identification', 
          value: 'You can specify users by:`@mention`', 
          inline: false 
        }
      )
      .setFooter({ text: 'Use !rolelist to see available role keys' });

    
    await message.reply({ embeds: [embed] });
  }

  // Role logs (admin only)
  if (command === 'rolelogs') {   
    // Check if command is FOUNDER
    if (!hasFounderPermission(message.member)) {
    return message.reply('❌ You need founder permissions to use this command!');
    }

    const limit = parseInt(args[1]) || 10;
    const logs = await RoleLog.find().sort({ timestamp: -1 }).limit(Math.min(limit, 50));
    
    if (logs.length === 0) {
      return message.reply('📝 No role logs found.');
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
      .setTitle('📋 Role Management Logs')
      .setDescription(description.slice(0, 4000))
      .setFooter({ text: `Showing ${logs.length} most recent logs` });
    
    await message.reply({ embeds: [embed] });
  }
}