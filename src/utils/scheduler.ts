import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { dutyDB } from '../database/duty';
import { formatUserList } from '../utils/users';
import { CONFIG } from '../config';

export function setupScheduler(client: Client) {
  // Schedule for every Monday at 7:30 AM Prague time (Europe/Prague timezone)
  // Cron format: minute hour day-of-month month day-of-week
  // Day 1 = Monday
  const cronExpression = '30 7 * * 1';
  
  cron.schedule(cronExpression, async () => {
    console.log('🕐 Running scheduled duty reminder...');
    
    try {
      const duty = dutyDB.getCurrentDuty();
      
      if (!duty || duty.length === 0) {
        console.log('⚠️ No duty assigned for this week, skipping reminder.');
        return;
      }
      
      const userList = formatUserList(duty);
      const message = `Dobré ráno! Služba pro tento týden je: ${userList}.`;
      
      // Get the channel to send the message to
      const channelId = CONFIG.reminderChannelId;
      
      if (!channelId) {
        console.error('❌ REMINDER_CHANNEL_ID not set in .env file');
        return;
      }
      
      const channel = await client.channels.fetch(channelId);
      
      if (!channel || !channel.isTextBased()) {
        console.error('❌ Channel not found or is not a text channel');
        return;
      }
      
      await (channel as TextChannel).send(message);
      console.log('✅ Duty reminder sent successfully');
      
    } catch (error) {
      console.error('❌ Error sending scheduled duty reminder:', error);
    }
  }, {
    timezone: 'Europe/Prague'
  });
  
  console.log('✅ Scheduler initialized - Monday reminders at 7:30 AM Prague time');
}
