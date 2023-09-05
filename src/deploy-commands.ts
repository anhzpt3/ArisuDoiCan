import { getCommandsDeploy } from "./commands";
import { REST, Routes } from "discord.js";
import "dotenv/config";

const commands = getCommandsDeploy();

const token = String(process.env.DISCORD_BOT_TOKEN);
const clientId = String(process.env.DISCORD_CLIENT_ID);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // Deploy Global commands
    const data: any = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Type: Global commands");
    console.log(
      `Successfully reloaded ${data?.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
