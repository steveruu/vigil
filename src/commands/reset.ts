import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Message } from 'discord.js';
import { dutyDB } from '../database/duty';
import { isAdmin } from '../utils/admin';

export const data = new SlashCommandBuilder()
  .setName('reset')
  .setDescription('Vymazat všechny záznamy služeb (pouze pro administrátory)')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
  // Check if user is the specific admin
  if (!isAdmin(interaction.user.id)) {
    await interaction.reply({ content: '❌ Pouze Prchal Štěpán může použít tento příkaz.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    await dutyDB.clear();
    await interaction.editReply('✅ Všechny záznamy služeb byly vymazány.');
  } catch (error) {
    console.error('Error clearing duty database:', error);
    await interaction.editReply('❌ Chyba při mazání záznamů.');
  }
}

export async function executePrefix(message: Message): Promise<void> {
  // Check if user is the specific admin
  if (!isAdmin(message.author.id)) {
    if (message.channel.isSendable()) {
      await message.channel.send('❌ Pouze Prchal Štěpán může použít tento příkaz.');
    }
    return;
  }

  try {
    await dutyDB.clear();
    if (message.channel.isSendable()) {
      await message.channel.send('✅ Všechny záznamy služeb byly vymazány.');
    }
  } catch (error) {
    console.error('Error clearing duty database:', error);
    if (message.channel.isSendable()) {
      await message.channel.send('❌ Chyba při mazání záznamů.');
    }
  }
}
