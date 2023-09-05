import { CmdType } from ".";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import {
  AudioPlayerStatus,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import { createAudioPlayer } from "@discordjs/voice";
// import ytdl from "ytdl-core";
import play, { SoundCloudStream, YouTubeStream, YouTubeVideo } from "play-dl";
import { getYouTubeVideoIdFromUrl } from "../utils/common";

interface Song {
  title: string;
  duration: string;
  url: string;
}
export let playlist: Song[] = [];// mảng danh sách bài
export const setPlaylist = (newState: Song[]) => {
  playlist = newState;
}
export let isPlaying = false;
export const setIsPlaying = (newState: boolean) => {
  isPlaying = newState;
}
export let player = createAudioPlayer();
// Biến để kiểm tra nếu bot đang phát bài

export const Play: CmdType = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play song!")
    .addStringOption((option) =>
      option.setName("search").setDescription("Youtube link.").setRequired(true)
    ),
  execute: async (interaction) => {
    await interaction.deferReply();
    // Tùy chỉnh chất lượng âm thanh

    const guildMember = interaction.member as GuildMember;
    if (!guildMember?.voice?.channel?.id) {
      //
      await interaction.followUp('Bạn cần tham gia một kênh thoại trước.');
      return;
    };
    let searchText = interaction.options.getString("search", true);

    if (searchText.startsWith('https://')) {
      const videoId = getYouTubeVideoIdFromUrl(searchText);

      if (!videoId) {
        await interaction.followUp({
          content: 'Không tìm thấy video nào!',
          ephemeral: true,
        });
        return;
      }

      searchText = `https://youtu.be/${videoId}`;
    }


    player.on(AudioPlayerStatus.Playing, () => {
      console.log("The audio player has started playing!");
    });

    player.on("error", (error) => {
      console.error(`Player error: ${error.message} with resource`);
      console.log(error);
    });

    player.on(AudioPlayerStatus.Idle, async () => {//khi hát hết 1 bài trong mảng playlist
      playlist.shift();

      if (playlist.length > 0) {// nếu danh sách bài hát lớn hơn 0
        stream2 = await play.stream(playlist[0]?.url);
        const resource2 = createAudioResource(stream2.stream, {
          inputType: stream2.type,
        });
        player.play(resource2);//chạy bài đầu tiên trong list
        await interaction.reply(`Đang phát:  ${playlist[0].title} `);
      } else {
        isPlaying = false;
        // console.log('end list');
      }
    });

    ///
    let stream2: YouTubeStream | SoundCloudStream;
    let yt_info: YouTubeVideo[] = await play.search(searchText, {
      limit: 1,
    });

    try {
      // play-dl
      if (yt_info?.length <= 0) {
        await interaction.followUp({
          content: "Không tìm thấy video nào!",
          ephemeral: true,
        });
        return;
      }
      //lây ra thông tin bài hát
      playlist.push({//đẩy bài nhạc vào list (playlist)
        title: yt_info[0].title,
        duration: yt_info[0].durationRaw,
        url: yt_info[0].url
      });

      if (!isPlaying) {//nếu không có bài nào đang phát
        stream2 = await play.stream(playlist[0]?.url);
        const resource2 = createAudioResource(stream2.stream, {
          inputType: stream2.type,
        });
        player.play(resource2);//chạy bài đầu tiên trong list
        isPlaying = true;//biến đang hát = true
        const voiceConnection = joinVoiceChannel({//connet vô phòng thoại người dùng gọi bot nếu bot đang ở ngoài đường
          channelId: guildMember.voice.channelId,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const subscription = voiceConnection.subscribe(player);
        if (subscription) {
          ///...
        }
      }

    } catch (error) {
      console.log("Stream error: ");
      console.log(error);
    }

    await interaction.followUp({
      content: `Playing ${yt_info[0].url}`,
      ephemeral: true,
    });
  },
};
