import { CmdType } from ".";
import { SlashCommandBuilder } from "discord.js";

export const Ping: CmdType = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  execute: async (interaction) => {
    await interaction.reply({ content: "Pong!", ephemeral: true });
  },
};
