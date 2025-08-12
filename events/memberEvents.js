// events/memberEvents.js - Member join/leave event handlers
import { getUserData } from '../systems/xpSystem.js';
import { updateVerificationEmbed } from '../systems/verificationSystem.js';

export function handleMemberEvents(client) {
  // Handle member join
  client.on('guildMemberAdd', async (member) => {
    await getUserData(member.id);
    await updateVerificationEmbed(member.guild);
  });

  // Handle member leave
  client.on('guildMemberRemove', async (member) => {
    await updateVerificationEmbed(member.guild);
  });

  client.on('messageCreate', async message => {
  if (message.content === '!clearall' && message.member.permissions.has('ManageMessages')) {
    try {
      // Hapus sampai 100 pesan terakhir (Discord membatasi bulk delete max 100)
      const fetched = await message.channel.messages.fetch({ limit: 100 });
      await message.channel.bulkDelete(fetched);

      message.channel.send('✅ Messages cleared!').then(msg => setTimeout(() => msg.delete(), 3000));
    } catch (error) {
      console.error(error);
      message.channel.send('❌ Failed to clear messages.');
    }
  }
});
}