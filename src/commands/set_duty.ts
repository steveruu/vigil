import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, Message } from 'discord.js';
import { dutyDB } from '../database/duty';
import { isAdmin } from '../utils/admin';

export const data = new SlashCommandBuilder()
  .setName('manual')
  .setDescription('Nastavit službu pro konkrétní období (pouze pro administrátory)')
  .addStringOption(option =>
    option
      .setName('od')
      .setDescription('Datum začátku (DD.MM.YYYY nebo YYYY-MM-DD)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('do')
      .setDescription('Datum konce (DD.MM.YYYY nebo YYYY-MM-DD)')
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName('jmena')
      .setDescription('Jména žáků oddělená čárkou (např: Jan Novák, Petr Dvořák)')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

function parseDate(dateStr: string): Date | null {
  const ddmmyyyy = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const yyyymmdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  
  let match = dateStr.match(ddmmyyyy);
  if (match) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const year = parseInt(match[3]);
    return new Date(year, month, day);
  }
  
  match = dateStr.match(yyyymmdd);
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    return new Date(year, month, day);
  }
  
  return null;
}

export async function executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
  // Check if user is the specific admin
  if (!isAdmin(interaction.user.id)) {
    await interaction.reply({ content: '❌ Pouze Prchal Štěpán může použít tento příkaz.', ephemeral: true });
    return;
  }

  const fromDateStr = interaction.options.getString('od', true);
  const toDateStr = interaction.options.getString('do', true);
  const namesInput = interaction.options.getString('jmena', true);
  
  const fromDate = parseDate(fromDateStr);
  const toDate = parseDate(toDateStr);
  
  if (!fromDate || !toDate) {
    await interaction.reply({ 
      content: '❌ Neplatný formát data. Použijte DD.MM.YYYY nebo YYYY-MM-DD', 
      ephemeral: true 
    });
    return;
  }
  
  if (fromDate > toDate) {
    await interaction.reply({ 
      content: '❌ Datum začátku musí být před datem konce.', 
      ephemeral: true 
    });
    return;
  }
  
  const users = namesInput.split(',').map(name => name.trim()).filter(name => name.length > 0);
  
  if (users.length === 0) {
    await interaction.reply({ content: '❌ Musíte zadat alespoň jedno jméno.', ephemeral: true });
    return;
  }

  await dutyDB.addDuty(fromDate, toDate, users);
  
  const userList = users.map((name: string) => `**${name}**`).join(', ');
  const formatDate = (d: Date) => d.toLocaleDateString('cs-CZ');
  await interaction.reply({ 
    content: `✅ Služba pro období **${formatDate(fromDate)}** - **${formatDate(toDate)}** byla nastavena: ${userList}`, 
    ephemeral: true 
  });
}

export async function executePrefix(message: Message): Promise<void> {
  // Check if user is the specific admin
  if (!isAdmin(message.author.id)) {
    if (message.channel.isSendable()) {
      await message.channel.send('❌ Pouze Prchal Štěpán může použít tento příkaz.');
    }
    return;
  }

  const args = message.content.slice(message.content.indexOf(' ') + 1).trim();
  const parts = args.split(',').map(p => p.trim());
  
  if (parts.length < 3) {
    await message.reply('❌ Formát: `v!nastavsluzbu od, do, jméno1, jméno2`\nPříklad: `v!nastavsluzbu 21.10.2025, 27.10.2025, Jan Novák, Petr Dvořák`');
    return;
  }

  const fromDate = parseDate(parts[0]);
  const toDate = parseDate(parts[1]);
  
  if (!fromDate || !toDate) {
    await message.reply('❌ Neplatný formát data. Použijte DD.MM.YYYY nebo YYYY-MM-DD');
    return;
  }
  
  if (fromDate > toDate) {
    await message.reply('❌ Datum začátku musí být před datem konce.');
    return;
  }

  const users = parts.slice(2).filter(name => name.length > 0);
  
  if (users.length === 0) {
    await message.reply('❌ Musíte zadat alespoň jedno jméno.');
    return;
  }

  await dutyDB.addDuty(fromDate, toDate, users);
  
  const userList = users.map((name: string) => `**${name}**`).join(', ');
  const formatDate = (d: Date) => d.toLocaleDateString('cs-CZ');
  await message.reply(`✅ Služba pro období **${formatDate(fromDate)}** - **${formatDate(toDate)}** byla nastavena: ${userList}`);
}
