import { SlashCommandBuilder, CommandInteraction, Message } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');

export async function executeSlash(interaction: CommandInteraction): Promise<void> {
  const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(`🏓 pong! trvalo ${latency}ms | ws: ${interaction.client.ws.ping}ms`);
}

export async function executePrefix(message: Message): Promise<void> {
  const sent = await message.reply('Pinging...');
  const latency = sent.createdTimestamp - message.createdTimestamp;
  await sent.edit(`🏓 pong! trvalo ${latency}ms | ws: ${message.client.ws.ping}ms`);
}
