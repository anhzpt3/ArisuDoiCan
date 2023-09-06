import { CmdType } from ".";
import { GuildMember, SlashCommandBuilder, ActivityType, EmbedBuilder, } from "discord.js";
import {
  AudioPlayerStatus,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import { createAudioPlayer } from "@discordjs/voice";
// import ytdl from "ytdl-core";
import play, { SoundCloudStream, YouTubeStream, YouTubeVideo } from "play-dl";
// import { client } from ".."; t gây lỗi ở đây nè =)) import owr

interface Song {
  title: string;
  duration: string;
  url: string;
  thumbnail: string;
}

export let playlist: Song[] = [];// mảng danh sách bài
export const setPlaylist = (newState: Song[]) => {
  playlist = newState;
}
export let isPlaying = false;// Biến để kiểm tra nếu bot đang phát bài
export const setIsPlaying = (newState: boolean) => {
  isPlaying = newState;
}
export let lastRepliedChannel = null;//bot vừa reply kênh nào
export const setLastRepliedChannel = (newState: any) => {
  lastRepliedChannel = newState;
}
export let player = createAudioPlayer();

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
    // client.user.setActivity({ name: `${playlist[0]?.title}`, type: ActivityType.Listening });
    // setBotStatus(playlist[0]?.title, { type: ActivityType.Listening })

    const streamYoutube = await play.stream(playlist[0]?.url);
    const resource2 = createAudioResource(streamYoutube.stream, {
      inputType: streamYoutube.type,
    });
    player.play(resource2);//chạy bài đầu tiên trong list
    console.log(`Đang phát:  ${playlist[0]?.title}`);

    // trả ra tin nhắn mỗi khi next bài
    const embed = new EmbedBuilder()
      .setTitle(`PLAY NOW`)
      .setColor(0xCF40FA)
      .setThumbnail(playlist[0].thumbnail)
      .setDescription(`${playlist[0]?.title} \n  ${playlist[0]?.duration}`)
    lastRepliedChannel.send({ embeds: [embed] })
    //await interaction.followUp(`Đang phát:  ${playlist[0]?.title} `);

  } else {
    isPlaying = false;
    // client.user.setActivity(`free phai`);
    // console.log('end list');
  }
});

export const Play: CmdType = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play song!")
    .addStringOption((option) =>
      option.setName("search").setDescription("Youtube link.").setRequired(true)
    ),
  execute: async (interaction) => {
    await interaction.deferReply();

    const embed = new EmbedBuilder()
      .setTitle(`Add to list`)
      .setColor(0xCF40FA)

    const guildMember = interaction.member as GuildMember;
    if (!guildMember?.voice?.channel?.id) {
      //
      await interaction.followUp('Bạn cần tham gia một kênh thoại trước.');
      return;
    };
    let searchText = interaction.options.getString("search", true);

    let songInfo: YouTubeVideo;
    let stream2: YouTubeStream | SoundCloudStream;

    if (searchText.startsWith('https://')) {
      const infoData = await play.video_info(searchText)

      songInfo = infoData?.video_details
    } else {
      const listResult = await play.search(searchText, {
        limit: 1,
      })

      songInfo = listResult[0]
    }

    try {
      // play-dl
      if (!songInfo) {
        await interaction.followUp({
          content: "Không tìm thấy video nào!",
          ephemeral: true,
        });
        return;
      }
      //lây ra thông tin bài hát
      playlist.push({//đẩy bài nhạc vào list (playlist)
        title: songInfo.title,
        duration: songInfo.durationRaw,
        url: songInfo.url,
        thumbnail: songInfo.thumbnails[0].url,
      });

      embed.setDescription(`${songInfo.title}\n${songInfo.durationRaw}`)
      embed.setThumbnail(songInfo.thumbnails[0].url)
      if (!isPlaying && playlist?.length > 0) {
        //nếu không có bài nào đang phát và playlist có bài
        stream2 = await play.stream(playlist[0].url);
        const resource2 = createAudioResource(stream2.stream, { inputType: stream2.type, });
        player.play(resource2);//chạy bài đầu tiên trong list
        // client.user.setActivity(playlist[0].title);
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

    // trả followup link bài hát khi người dùng bấm /play
    await interaction.followUp({ embeds: [embed] });
    // lấy ra channel bot khi folloup
    setLastRepliedChannel(interaction.channel);
    // gửi thêm 1 tin nhắn vs thông tin là mảng ember


  },
};
