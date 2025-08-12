// index.js - Main entry point
import {
  Client,
  GatewayIntentBits,
  Partials
} from 'discord.js';
import 'dotenv/config';
import { connectDB } from './database/connection.js';
import { setupEventHandlers } from './events/index.js';
import { CONFIG } from './config/config.js';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// Connect to database
connectDB();

// Setup all event handlers
setupEventHandlers(client);

// Login to Discord
client.login(process.env.TOKEN);

export { client };

export function startDiscordBot() {
  console.log("Bot sedang berjalan...");
}
