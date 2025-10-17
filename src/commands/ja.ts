import { SlashCommandBuilder, CommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { dutyDB } from '../database/duty';
import users from '../data/users.json';

export const data = new SlashCommandBuilder()
  .setName('ja')
  .setDescription('Zjistit, kdy máš službu');

function getUserNameByDiscordId(discordId: string): string | null {
  for (const [name, id] of Object.entries(users)) {
    if (id === discordId) {
      return name;
    }
  }
  return null;
}

export async function executeSlash(interaction: CommandInteraction): Promise<void> {
  const userName = getUserNameByDiscordId(interaction.user.id);
  
  if (!userName) {
    await interaction.reply({ 
      content: '❌ Tvoje Discord ID není v seznamu služeb. Kontaktuj Prchala Štěpána.', 
      ephemeral: true 
    });
    return;
  }

  const allDuties = dutyDB.getAllDuties();
  const myDuties = allDuties.filter(duty => 
    duty.users.some(user => user.toLowerCase() === userName.toLowerCase())
  );

  if (myDuties.length === 0) {
    await interaction.reply({ 
      content: '❌ Nemáš naplánovanou žádnou službu.', 
      ephemeral: true 
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`📋 Tvoje služby (${userName})`)
    .setColor(0x5865F2)
    .setDescription(`Máš celkem **${myDuties.length}** služeb:`)
    .setTimestamp();

  myDuties.forEach((duty, index) => {
    const fromDate = new Date(duty.fromDate);
    const toDate = new Date(duty.toDate);
    const formatDate = (d: Date) => d.toLocaleDateString('cs-CZ');
    const partner = duty.users.find(u => u.toLowerCase() !== userName.toLowerCase());
    
    const dateRange = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
    const partnerText = partner ? `s **${partner}**` : 'sám/sama';
    
    embed.addFields({
      name: `${index + 1}. ${dateRange}`,
      value: partnerText,
      inline: false
    });
  });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

export async function executePrefix(message: Message): Promise<void> {
  try {
    const userName = getUserNameByDiscordId(message.author.id);
    
    if (!userName) {
      if (message.channel.isSendable()) {
        await message.channel.send('❌ Tvoje Discord ID není v seznamu služeb. Kontaktuj Prchala Štěpána.');
      }
      return;
    }

    const allDuties = dutyDB.getAllDuties();
    const myDuties = allDuties.filter(duty => 
      duty.users.some(user => user.toLowerCase() === userName.toLowerCase())
    );

    if (myDuties.length === 0) {
      if (message.channel.isSendable()) {
        await message.channel.send('❌ Nemáš naplánovanou žádnou službu.');
      }
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 Tvoje služby (${userName})`)
      .setColor(0x5865F2)
      .setDescription(`Máš celkem **${myDuties.length}** služeb:`)
      .setTimestamp();

    myDuties.forEach((duty, index) => {
      const fromDate = new Date(duty.fromDate);
      const toDate = new Date(duty.toDate);
      const formatDate = (d: Date) => d.toLocaleDateString('cs-CZ');
      const partner = duty.users.find(u => u.toLowerCase() !== userName.toLowerCase());
      
      const dateRange = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
      const partnerText = partner ? `s **${partner}**` : 'sám/sama';
      
      embed.addFields({
        name: `${index + 1}. ${dateRange}`,
        value: partnerText,
        inline: false
      });
    });

    if (message.channel.isSendable()) {
      await message.channel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error in ja command:', error);
  }
}
