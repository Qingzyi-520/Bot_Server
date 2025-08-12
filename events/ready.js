// events/ready.js - Bot ready event handler
import { CONFIG } from '../config/config.js';
import { setupVerificationMessage } from '../systems/verificationSystem.js';
import { checkDailyBonuses } from '../systems/xpSystem.js';

export function handleReady(client) {
  client.once('ready', async () => {
    console.log(`✅ Bot login sebagai ${client.user.tag}`);
    
    const guild = client.guilds.cache.get(CONFIG.GUILD_ID);
    if (guild) {
      // Setup verification message
      await setupVerificationMessage(guild);
      
      // Start daily bonus checker (runs every minute)
      setInterval(() => checkDailyBonuses(client), 60000);
    }
  });
}