import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { CONFIG } from './config';
import { dutyDB } from './database/duty';
import { setupScheduler } from './utils/scheduler';
import * as pingCommand from './commands/ping';
import * as sluzbaCommand from './commands/duty';
import * as importCommand from './commands/import_duty';
import * as manualCommand from './commands/set_duty';
import * as resetCommand from './commands/reset';
import * as rozpisCommand from './commands/rozpis';
import * as jaCommand from './commands/ja';

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
commands.set('sluzba', sluzbaCommand as Command);
commands.set('import', importCommand as Command);
commands.set('manual', manualCommand as Command);
commands.set('reset', resetCommand as Command);
commands.set('rozpis', rozpisCommand as Command);
commands.set('ja', jaCommand as Command);

// Initialize database
dutyDB.init().then(() => {
  console.log('✅ Duty database initialized');
}).catch(error => {
  console.error('❌ Error initializing duty database:', error);
});

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  console.log(`📝 Prefix: ${CONFIG.prefix}`);
  console.log(`🤖 Bot ID: ${c.user.id}`);
  console.log(`📊 Registered ${commands.size} commands`);
  
  // Setup scheduled tasks
  setupScheduler(client);
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
  // Debug: log all messages (remove this after testing)
  if (!message.author.bot) {
    console.log(`📨 Message from ${message.author.tag}: ${message.content}`);
  }
  
  if (message.author.bot || !message.content.startsWith(CONFIG.prefix)) return;

  console.log(`🎯 Command detected: ${message.content}`);
  
  const args = message.content.slice(CONFIG.prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  console.log(`🔍 Looking for command: ${commandName}`);
  
  const command = commands.get(commandName);
  if (!command || !command.executePrefix) {
    console.log(`❌ Command not found or no prefix handler: ${commandName}`);
    return;
  }

  console.log(`✅ Executing command: ${commandName}`);

  try {
    await command.executePrefix(message);
  } catch (error) {
    console.error('Error executing command:', error);
    try {
      if (message.channel.isSendable()) {
        await message.channel.send('There was an error executing this command!');
      }
    } catch (replyError) {
      console.error('Could not send error message (missing permissions):', replyError);
    }
  }
});

client.login(CONFIG.token);
