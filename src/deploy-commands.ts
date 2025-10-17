import { REST, Routes } from 'discord.js';
import { CONFIG } from './config';
import * as pingCommand from './commands/ping';

const commands = [
  pingCommand.data.toJSON(),
];

const rest = new REST().setToken(CONFIG.token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(CONFIG.clientId),
      { body: commands },
    ) as any[];

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
