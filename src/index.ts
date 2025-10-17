import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { CONFIG } from './config';
import * as pingCommand from './commands/ping';

interface Command {
  data: any;
  executeSlash: (interaction: any) => Promise<void>;
  executePrefix?: (message: any) => Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Collection<string, Command>();
commands.set('ping', pingCommand as Command);

client.once(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
  console.log(`Prefix: ${CONFIG.prefix}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.executeSlash(interaction);
  } catch (error) {
    console.error(error);
    const errorMessage = { content: 'There was an error executing this command!', ephemeral: true };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !message.content.startsWith(CONFIG.prefix)) return;

  const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);
  if (!command || !command.executePrefix) return;

  try {
    await command.executePrefix(message);
  } catch (error) {
    console.error(error);
    await message.reply('There was an error executing this command!');
  }
});

client.login(CONFIG.token);
