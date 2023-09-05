import { CmdType } from ".";
import { Client, Events, GatewayIntentBits, GuildMember, SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
import { player, playlist, setIsPlaying, setPlaylist } from "./play";



export const DisconnectCommand: CmdType = {
  data: new SlashCommandBuilder()
    .setName("cook")
    .setDescription("Disconnect the bot from the voice channel"),
  execute: async (interaction) => {
    const guildMember = interaction.member as GuildMember;
    const voiceConnection = getVoiceConnection(guildMember.guild.id);

    if (voiceConnection) {
      setIsPlaying(false);
      setPlaylist([]);
      voiceConnection.destroy();
      console.log(playlist);
      await interaction.reply("Tao đi nấu đây.");
    } else {
      voiceConnection.destroy();
      await interaction.reply("Tao có trong phòng đâu mà đuổi.");
    }
  },
};


