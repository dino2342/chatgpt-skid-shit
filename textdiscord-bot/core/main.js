import { config as loadEnv } from 'dotenv';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadBotConfig() {
  const configPath = path.join(__dirname, '../config/botConfig.json');
  try {
    const raw = await readFile(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    console.log('[Config] Loaded bot configuration');
    return parsed;
  } catch (error) {
    console.error('[Config] Failed to read botConfig.json, falling back to defaults:', error.message);
    return { intents: ['Guilds'] };
  }
}

function resolveIntents(intents) {
  const resolved = [];
  for (const intentName of intents) {
    if (GatewayIntentBits[intentName]) {
      resolved.push(GatewayIntentBits[intentName]);
    } else {
      console.warn(`[Config] Unknown intent "${intentName}" - skipping`);
    }
  }
  if (resolved.length === 0) {
    console.warn('[Config] No valid intents provided, defaulting to Guilds');
    resolved.push(GatewayIntentBits.Guilds);
  }
  return resolved;
}

async function loadCommands(client) {
  const commandsDir = path.join(__dirname, '../commands');
  const files = await fs.readdir(commandsDir);
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const filePath = path.join(commandsDir, file);
    try {
      const commandModule = await import(pathToFileURL(filePath));
      if (commandModule?.data && typeof commandModule.execute === 'function') {
        client.commands.set(commandModule.data.name, commandModule);
        console.log(`[Commands] Loaded command: ${commandModule.data.name}`);
      } else {
        console.warn(`[Commands] ${file} is missing required exports`);
      }
    } catch (error) {
      console.error(`[Commands] Failed to load ${file}:`, error);
    }
  }
}

async function loadHandlers(client) {
  const handlersDir = path.join(__dirname, '../handlers');
  const files = await fs.readdir(handlersDir);
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    const filePath = path.join(handlersDir, file);
    try {
      const handlerModule = await import(pathToFileURL(filePath));
      if (typeof handlerModule?.default === 'function') {
        handlerModule.default(client);
        console.log(`[Handlers] Registered handler: ${file}`);
      } else {
        console.warn(`[Handlers] ${file} does not export a default function`);
      }
    } catch (error) {
      console.error(`[Handlers] Failed to register ${file}:`, error);
    }
  }
}

async function bootstrap() {
  const botConfig = await loadBotConfig();
  const intents = resolveIntents(botConfig.intents ?? []);
  const client = new Client({
    intents,
    presence: botConfig.presence,
  });

  client.commands = new Collection();

  await loadCommands(client);
  await loadHandlers(client);

  const token = process.env.TOKEN;
  if (!token) {
    console.error('[Startup] TOKEN env variable is missing. Bot will not log in.');
    return;
  }

  console.log('[Startup] Logging in...');
  client
    .login(token)
    .then(() => console.log('[Startup] Login request sent'))
    .catch((error) => console.error('[Startup] Login failed:', error));
}

bootstrap();
