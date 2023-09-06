import {
  ChatInputCommandInteraction,
  Collection,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import { Nyanz } from "./nyanz";
import { Ping } from "./ping";
import { Play } from "./play";
import { Reload } from "./reload";
import { TextToSpeech } from "./tts";
import { Skip } from "./skip";
import { DisconnectCommand } from "./disconnect";
import { Show } from "./show";

export type CmdType = {
  data:
  | SlashCommandBuilder
  | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const listCommand = [
  // Ping,
  //  Nyanz, 
  Play,
  Skip,
  Show,
  DisconnectCommand,
  // Reload,
  // TextToSpeech
];

let commands = new Collection<string, CmdType>();

export const getCommands = () => {
  return commands;
};

export const setCommands = (newCommand: Collection<string, CmdType>) => {
  commands = newCommand;
};

export const initCommands = () => {
  for (const command of listCommand) {
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${String(
          command
        )} is missing a required "data" or "execute" property.`
      );
    }
  }

  return commands;
};

export const getCommandsDeploy = () => {
  const commandsDeploy: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  for (const command of listCommand) {
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      commandsDeploy.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${String(
          command
        )} is missing a required "data" or "execute" property.`
      );
    }
  }

  return commandsDeploy;
};
