import { CmdType } from ".";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { playlist } from "./play";


export const Show: CmdType = {
  data: new SlashCommandBuilder()
    .setName("show")
    .setDescription("danh sách phát nhạc hiện tại"),
  execute: async (interaction) => {
    if (playlist.length > 0) {
      let content = '';

      playlist.forEach((song, index) => {
        content += `${index + 1}. ${song.title} - ${song.duration} \n`;
      });

      let list = new EmbedBuilder()
        .setTitle(`LIST SONG`)
        .setColor(0xCF40FA)
        .setDescription(content);

      console.log(content);
      await interaction.reply({ embeds: [list] });
    } else {
      await interaction.reply({
        content: `không có bài nào cả`
      });
    }
  },
};