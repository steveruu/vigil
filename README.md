# Vigil Discord Bot

A simple TypeScript Discord bot with both slash commands and prefix commands.

## Features

- ✅ Slash command: `/ping`
- ✅ Prefix command: `v!ping`
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
   ```
   
   - Get your bot token from [Discord Developer Portal](https://discord.com/developers/applications)
   - CLIENT_ID is your bot's Application ID (found in the same portal)

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

## Project Structure

```
vigil/
├── src/
│   ├── commands/
│   │   └── ping.ts       # Ping command implementation
│   ├── config.ts          # Bot configuration
│   ├── index.ts           # Main bot file
│   └── deploy-commands.ts # Slash command deployment
├── dist/                  # Compiled JavaScript (auto-generated)
├── .env                   # Environment variables (create this)
├── .env.example          # Example environment file
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## Adding New Commands

1. Create a new file in `src/commands/` (e.g., `hello.ts`)
2. Export `data`, `executeSlash`, and optionally `executePrefix`
3. Import and register the command in `src/index.ts`
4. Import and add to the commands array in `src/deploy-commands.ts`
5. Run `npm run deploy` to register the slash command

## License

ISC
