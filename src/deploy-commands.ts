import { REST, Routes } from 'discord.js';
import { CONFIG } from './config';
import * as pingCommand from './commands/ping';
import * as sluzbaCommand from './commands/duty';
import * as importCommand from './commands/import_duty';
import * as manualCommand from './commands/set_duty';
import * as resetCommand from './commands/reset';
import * as rozpisCommand from './commands/rozpis';

const commands = [
  pingCommand.data.toJSON(),
  sluzbaCommand.data.toJSON(),
  importCommand.data.toJSON(),
  manualCommand.data.toJSON(),
  resetCommand.data.toJSON(),
  rozpisCommand.data.toJSON(),
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
