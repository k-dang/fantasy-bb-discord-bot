const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Exiting early, nothing to delete');
  return;
}

const commandId = args[0];

// for guild-based commands
// rest
//   .delete(Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, commandId))
//   .then(() => console.log('Successfully deleted guild command'))
//   .catch(console.error);

// for global commands
// rest
//   .delete(Routes.applicationCommand(process.env.CLIENT_ID, commandId))
//   .then(() => console.log('Successfully deleted application command'))
//   .catch(console.error);
