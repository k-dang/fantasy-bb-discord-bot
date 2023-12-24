# fantasy-bb-discord-bot

Discord bot that connects to Yahoo Fantasy Basketball APIs to display stats

## Local dev setup

Setup `.env` file by making a copy of `.env.sample` and renaming it

## Local development Yahoo Auth

We use [ngrok](https://ngrok.com/docs/getting-started/) to proxy our localhost for yahoo oauth since they don't allow localhost redirect urls

Start a HTTP tunnel forwarding to local port 3000 and updated the AUTH_REDIRECT_URL env variable with the ngrok url

```bash
ngrok http 3000
```

Add the ngrok url to the **Redirect URI(s)** section in the yahoo developer console under your app

## Start local development

We start the development server with

```bash
npm run start
```

### Deploying commands

We can deploy slash commands to our specified guild (discord server) using

```bash
npm run deploy:dev
```

Or to deploy globally to all servers the bot is added to using

```bash
npm run deploy
```

### Deleting commands

