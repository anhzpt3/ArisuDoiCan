import { CmdType, getCommands } from ".";
import { SlashCommandBuilder } from "discord.js";

export const Reload: CmdType = {
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads a command.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to reload.")
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const commands = getCommands();

    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();
    const command = commands.get(commandName);

    if (!command) {
      await interaction.reply(
        `There is no command with name \`${commandName}\`!`
      );
      return;
    }

    delete require.cache[require.resolve(`./${command.data.name}.ts`)];

    try {
      commands.delete(command.data.name);
      const newCommandObject = require(`./${command.data.name}.ts`);
      const newCommand: CmdType =
        newCommandObject[Object.keys(newCommandObject)[0]];

      commands.set(newCommand.data.name, newCommand);
      await interaction.reply({
        content: `Command \`${newCommand.data.name}\` was reloaded!`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``,
        ephemeral: true,
      });
    }
  },
};
