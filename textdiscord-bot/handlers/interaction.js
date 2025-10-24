export default function registerInteractionHandler(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.warn(`[Interaction] No handler found for ${interaction.commandName}`);
      try {
        await interaction.reply({ content: 'Command not recognized.', ephemeral: true });
      } catch (error) {
        console.error('[Interaction] Failed to reply to unknown command:', error);
      }
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`[Interaction] Error executing ${interaction.commandName}:`, error);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'An unexpected error occurred while processing the command.' });
      } else {
        await interaction.reply({ content: 'An unexpected error occurred while processing the command.', ephemeral: true });
      }
    }
  });
}
