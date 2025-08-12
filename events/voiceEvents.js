// events/voiceEvents.js - Voice state event handlers
import { CONFIG } from '../config/config.js';
import { addXP } from '../systems/xpSystem.js';

let voiceTracking = {};

export function handleVoiceEvents(client) {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const userId = newState.member.id;
    const now = Date.now();

    // User joined voice channel
    if (!oldState.channelId && newState.channelId) {
      voiceTracking[userId] = now;
    } 
    // User left voice channel
    else if (oldState.channelId && !newState.channelId) {
      if (voiceTracking[userId]) {
        const minutes = Math.floor((now - voiceTracking[userId]) / 60000);
        if (minutes > 0) {
          const user = await addXP(userId, minutes * CONFIG.XP.VOICE_PER_MINUTE);
          user.voiceTime += minutes * 60000;
          await user.save();
        }
        delete voiceTracking[userId];
      }
    }
  });
}