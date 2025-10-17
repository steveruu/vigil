import { SlashCommandBuilder, CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { dutyDB } from '../database/duty';
import { formatUserMention } from '../utils/users';

export const data = new SlashCommandBuilder()
  .setName('rozpis')
  .setDescription('Zobrazí celý rozpis služeb');

function formatDate(date: Date): string {
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' });
}

function createRozpisEmbed(): EmbedBuilder {
  const duties = dutyDB.getAllDuties();
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('📋 Rozpis služeb')
    .setTimestamp();

  if (duties.length === 0) {
    embed.setDescription('Žádné služby nejsou nastaveny.');
    return embed;
  }

  // Group duties and create fields
  const fields: { name: string; value: string }[] = [];
  
  for (const duty of duties) {
    const fromStr = formatDate(duty.fromDate);
    const toStr = formatDate(duty.toDate);
    const period = `${fromStr} - ${toStr}`;
    
    let userList: string;
    if (duty.users.length === 0) {
      userList = '*Nikdo*';
    } else {
      userList = duty.users.map(name => formatUserMention(name)).join('\n');
    }
    
    fields.push({
      name: period,
      value: userList,
    });
  }

  // Discord embeds have a limit of 25 fields, so we need to chunk if necessary
  const fieldsToAdd = fields.slice(0, 25);
  
  for (const field of fieldsToAdd) {
    embed.addFields(field);
  }

  if (fields.length > 25) {
    embed.setFooter({ text: `Zobrazeno ${fieldsToAdd.length} z ${fields.length} záznamů` });
  } else {
    embed.setFooter({ text: `Celkem ${fields.length} záznamů` });
  }

  return embed;
}

export async function executeSlash(interaction: CommandInteraction): Promise<void> {
  await interaction.deferReply();
  
  const embed = createRozpisEmbed();
  await interaction.editReply({ embeds: [embed] });
}

export async function executePrefix(message: Message): Promise<void> {
  try {
    if (!message.channel.isSendable()) return;
    
    const embed = createRozpisEmbed();
    await message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error in rozpis command:', error);
  }
}
