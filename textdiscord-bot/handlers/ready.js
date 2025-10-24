import { REST, Routes } from 'discord.js';

export default function registerReadyHandler(client) {
  client.once('ready', async () => {
    console.log(`[Ready] Logged in as ${client.user.tag}`);

    const shouldDeploy = String(process.env.DEPLOY).toLowerCase() === 'true';
    if (!shouldDeploy) {
      console.log('[Ready] DEPLOY flag disabled. Skipping command registration.');
      return;
    }

    const commands = client.commands.map((command) => command.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
      console.log('[Ready] Registering global commands');
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log('[Ready] Global commands registered');
    } catch (error) {
      console.error('[Ready] Failed to register global commands:', error);
    }

    const guildId = process.env.GUILD_ID;
    if (guildId) {
      try {
        console.log(`[Ready] Registering guild commands for ${guildId}`);
        await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands });
        console.log('[Ready] Guild commands registered');
      } catch (error) {
        console.error('[Ready] Failed to register guild commands:', error);
      }
    }
  });
}
