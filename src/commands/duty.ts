import { SlashCommandBuilder, CommandInteraction, Message } from 'discord.js';
import { dutyDB } from '../database/duty';
import { formatUserList } from '../utils/users';

export const data = new SlashCommandBuilder()
  .setName('sluzba')
  .setDescription('Zobrazí, kdo má tento týden službu');

export async function executeSlash(interaction: CommandInteraction): Promise<void> {
  const duty = dutyDB.getCurrentDuty();

  if (!duty || duty.length === 0) {
    await interaction.reply('Pro tento týden není nastavena služba.');
    return;
  }

  const userList = formatUserList(duty);
  await interaction.reply(`Podle rozpisu má tento týden službu ${userList}.`);
}

export async function executePrefix(message: Message): Promise<void> {
  try {
    const duty = dutyDB.getCurrentDuty();

    if (!duty || duty.length === 0) {
      if (message.channel.isSendable()) {
        await message.channel.send('Pro tento týden není nastavena služba.');
      }
      return;
    }

    const userList = formatUserList(duty);
    if (message.channel.isSendable()) {
      await message.channel.send(`Podle rozpisu má tento týden službu ${userList}.`);
    }
  } catch (error) {
    console.error('Error in duty command:', error);
  }
}
