import { Client, Events, GatewayIntentBits } from "discord.js";
import { initCommands } from "./commands";
import express from "express";
import "dotenv/config";
import { player, playlist, setIsPlaying, setPlaylist } from "./commands/play";

const app = express();
const commands = initCommands();

// For testing purposes
app.get("/", (req, res) => {
  res.send("<h2>Nyanz is Working!</h2>");
});

app.listen(process.env.PORT, () => {
  console.log(`API is listening on port ${process.env.PORT}\n`);
});

// Create a new client instance
export const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});



client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

// nếu bot thoát khỏi kênh thoại, xóa toàn bộ playlist và set lại isplaying
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const botId = client.user.id;
  if (botId === newState.member.id && !newState?.channel?.id) {
    client.user.setActivity('zootobe');
    setIsPlaying(false);
    setPlaylist([]);
  }
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c: Client) => {
  client.user.setActivity('zootobe');
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_BOT_TOKEN);
