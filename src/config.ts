import { config } from 'dotenv';

config();

export const CONFIG = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  prefix: process.env.PREFIX || 'v!',
};
