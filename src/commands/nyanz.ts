import { CmdType } from ".";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const Nyanz: CmdType = {
  data: new SlashCommandBuilder()
    .setName("nyanz")
    .setDescription("Replies with Nyanz!"),
  async execute(interaction: ChatInputCommandInteraction) {
    // console.log(generateDependencyReport());
    await interaction.reply({
      content: "Nyanz! " + new Date().toUTCString(),
      ephemeral: true,
    });
  },
};
