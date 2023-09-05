// import textToSpeech from "@google-cloud/text-to-speech";
import { CmdType } from ".";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import {
  AudioPlayerStatus,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import { createAudioPlayer } from "@discordjs/voice";
import fs from "fs";
import util from "util";
import axios from "axios";

export const TextToSpeech: CmdType = {
  data: new SlashCommandBuilder()
    .setName("a")
    .setDescription("Text to speech!")
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Enter text to voice")
        .setRequired(true)
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const guildMember = interaction.member as GuildMember;

    let text = interaction.options.getString("text", true);

    const player = createAudioPlayer();

    player.on(AudioPlayerStatus.Playing, () => {
      console.log(
        `${guildMember.nickname || interaction.user.username} speaking: ` + text
      );
    });

    player.on("error", (error) => {
      console.error(`Player error: ${error.message} with resource`);
      console.log(error);
    });

    try {
      const request = {
        input: { text },
        // Select the language and SSML voice gender (optional)
        voice: { languageCode: "vi-VN", name: "vi-VN-Neural2-A" },
        // select the type of audio encoding
        audioConfig: {
          audioEncoding: "LINEAR16",
          effectsProfileId: ["handset-class-device"],
          pitch: 2,
          speakingRate: 1,
        },
      };

      const res = await axios.post(
        `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`,
        request
      );

      const folderTempPath = "./.temp/tts";
      const outputFilePath = `${folderTempPath}/output.mp3`;

      // Create the temporary directory if it doesn't exist
      await fs.promises.mkdir(folderTempPath, { recursive: true });

      // Write the binary audio content to a local file
      const writeFile = util.promisify(fs.writeFile);
      await writeFile(
        outputFilePath,
        Buffer.from(res.data.audioContent, "base64"),
        "binary"
      );
      const resource = createAudioResource(outputFilePath);

      const voiceConnection = joinVoiceChannel({
        channelId: guildMember.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const subscription = voiceConnection.subscribe(player);

      player.play(resource);

      // subscription could be undefined if the connection is destroyed!
      if (subscription) {
        // Unsubscribe after 10 seconds (stop playing audio on the voice connection)
        // setTimeout(() => subscription.unsubscribe(), 10000);
      }
    } catch (error) {
      console.log("Stream error: ");
      console.log(error);
    }

    await interaction.followUp({
      content: `Speaking ${text}`,
      ephemeral: true,
    });
  },
};
