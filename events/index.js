// events/index.js - Event handler setup
import { handleReady } from './ready.js';
import { handleMessageEvents } from './messageEvents.js';
import { handleReactionEvents } from './reactionEvents.js';
import { handleVoiceEvents } from './voiceEvents.js';
import { handleMemberEvents } from './memberEvents.js';

export function setupEventHandlers(client) {
  handleReady(client);
  handleMessageEvents(client);
  handleReactionEvents(client);
  handleVoiceEvents(client);
  handleMemberEvents(client);
}