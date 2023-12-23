const { SlashCommandBuilder, hyperlink } = require('discord.js');
const yahooOidc = require('../../services/yahooAuthorization');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('signin')
    .setDescription('Sign in with your yahoo account to grant access to get stats'),
  async execute(interaction) {
    const redirectUrl = yahooOidc.getRedirectUrl();
    const link = hyperlink('link', redirectUrl);
    await interaction.reply(`Please sign in using this ${link}`);
  },
};
