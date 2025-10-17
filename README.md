# Vigil Discord Bot

A simple TypeScript Discord bot with both slash commands and prefix commands. Includes a class duty tracking system with CSV import.

## Features

- ✅ `/ping` - Bot latency check
- 📋 `/sluzba` - Shows who has duty this week with Discord mentions
- � `/rozpis` - Displays full duty schedule in an embed
- 📁 `/import` - Import duties from CSV file (admin only)
- 🔧 `/manual` - Manually set duty for a date range (admin only)
- �️ `/reset` - Wipe all duty records (admin only)
- ⏰ **Automatic Monday Reminders** - Sends duty reminder every Monday at 7:30 AM Prague time
- ⚡ Built with TypeScript and discord.js v14

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   PREFIX=n!
   ADMIN_ID=402518467556671500
   REMINDER_CHANNEL_ID=your_channel_id_for_weekly_reminders
   ```
   
   - Get your bot token from [Discord Developer Portal](https://discord.com/developers/applications)
   - CLIENT_ID is your bot's Application ID (found in the same portal)
   - ADMIN_ID is the Discord user ID of the bot administrator (only this user can use admin commands)
   - REMINDER_CHANNEL_ID is the channel where Monday morning reminders will be sent

3. **Enable Required Intents**
   
   In the Discord Developer Portal, enable these intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Deploy slash commands**
   ```bash
   npm run deploy
   ```

6. **Start the bot**
   ```bash
   npm start
   ```

## Development

- **Build TypeScript:** `npm run build`
- **Start bot:** `npm start`
- **Build & start:** `npm run dev`
- **Deploy commands:** `npm run deploy`

## Commands

### `/ping` or `v!ping`
Checks the bot's latency and websocket ping.

### `/sluzba` or `v!sluzba`
Shows who has class duty this week. Response in Czech: "Službu má tento týden [jméno] a [jméno]..."

### `/nastavsluzbu [od] [do] [jména]` or `v!nastavsluzbu [od], [do], [jméno1], [jméno2]` (Admin only)
Set duty for a specific date range.
- **od**: Start date (DD.MM.YYYY or YYYY-MM-DD)
- **do**: End date (DD.MM.YYYY or YYYY-MM-DD)
- **jména**: Comma-separated list of names (second name is optional)

Example: `/nastavsluzbu 21.10.2025 27.10.2025 Jan Novák, Petr Dvořák`

### `/importsluzba [soubor]` (Admin only)
Import duties from a CSV file. Attach a CSV file with format:
```csv
# fromDate,toDate,name1,name2
21.10.2025,27.10.2025,Jan Novák,Petr Dvořák
28.10.2025,03.11.2025,Marie Svobodová
04.11.2025,10.11.2025,Lucie Veselá,Martin Procházka
```

Both date formats are supported: `DD.MM.YYYY` or `YYYY-MM-DD`. The second name is optional.

See `sluzby-priklad.csv` for an example.

## Project Structure

```
vigil/
├── src/
│   ├── commands/
│   │   ├── ping.ts           # Ping command
│   │   ├── sluzba.ts         # Show current week duty
│   │   ├── nastavsluzbu.ts   # Set duty (admin)
│   │   └── importsluzba.ts   # Import from CSV (admin)
│   ├── database/
│   │   └── duty.ts           # KV database for duties
│   ├── config.ts             # Bot configuration
│   ├── index.ts              # Main bot file
│   └── deploy-commands.ts    # Slash command deployment
├── data/
│   └── duty.json             # Stored duty data (auto-generated)
├── dist/                     # Compiled JavaScript (auto-generated)
├── sluzby-priklad.csv        # Example CSV file for import
├── .env                      # Environment variables (create this)
├── .env.example              # Example environment file
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## Adding New Commands

1. Create a new file in `src/commands/` (e.g., `hello.ts`)
2. Export `data`, `executeSlash`, and optionally `executePrefix`
3. Import and register the command in `src/index.ts`
4. Import and add to the commands array in `src/deploy-commands.ts`
5. Run `npm run deploy` to register the slash command

## License

ISC
