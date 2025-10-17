import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { dutyDB } from '../database/duty';
import { isAdmin } from '../utils/admin';

export const data = new SlashCommandBuilder()
  .setName('import')
  .setDescription('Importovat služby z CSV souboru (pouze pro administrátory)')
  .addAttachmentOption(option =>
    option
      .setName('soubor')
      .setDescription('CSV soubor se službami (formát: odDatum,doDatum,jméno1,jméno2)')
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
  // Check if user is the specific admin
  if (!isAdmin(interaction.user.id)) {
    await interaction.reply({ content: '❌ Pouze Prchal Štěpán může použít tento příkaz.', ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const attachment = interaction.options.getAttachment('soubor');
  
  if (!attachment) {
    await interaction.editReply('Nebyl nalezen žádný soubor.');
    return;
  }

  if (!attachment.name.endsWith('.csv')) {
    await interaction.editReply('Soubor musí být ve formátu CSV.');
    return;
  }

  try {
    const response = await fetch(attachment.url);
    const csvContent = await response.text();
    
    const imported = await dutyDB.importFromCSV(csvContent);
    
    await interaction.editReply(`Úspěšně importováno **${imported}** záznamů služeb.`);
  } catch (error) {
    console.error('Error importing CSV:', error);
    await interaction.editReply('Chyba při importu CSV souboru.');
  }
}
