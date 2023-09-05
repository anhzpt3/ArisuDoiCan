import { player, playlist, setIsPlaying } from "./play";
import { CmdType } from ".";
import { SlashCommandBuilder } from "discord.js";
import play, { SoundCloudStream, YouTubeStream, YouTubeVideo } from "play-dl";
import { createAudioPlayer, createAudioResource } from "@discordjs/voice";

export const Skip: CmdType = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("skip song !"),
  execute: async (interaction) => {
    if (playlist.length > 1) {// nếu danh sách bài hát lớn hơn 1
      playlist.shift();
      let stream2: YouTubeStream | SoundCloudStream;
      stream2 = await play.stream(playlist[0]?.url);
      const resource2 = createAudioResource(stream2.stream, {
        inputType: stream2.type,
      });
      player.play(resource2);//chạy bài đầu tiên trong list
      console.log(`---`);
      await interaction.reply(`Đang phát: ${playlist[0].title} `);
    } else if (playlist.length === 1) {// đã phát hết bài cuối
      playlist.shift();
      setIsPlaying(false);
      player.stop();
      await interaction.reply(`end list `);
      // console.log('end list');
    } else {
      await interaction.reply(`(¬‿¬)`);
    }
  },
};