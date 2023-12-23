const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require('discord.js');

const { getActiveLeagues } = require('../../services/yahooService');
const { cache, LEAGUE_KEY } = require('../../services/cache');
const { upsertLeague } = require('../../db/leagueRepository');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('setleague')
    .setDescription('Set the league to check stats for'),
  async execute(interaction) {
    const leagues = await getActiveLeagues();
    if (leagues.length == 0) {
      await interaction.reply('Currently, there are no active leagues.');
      return;
    }

    // build options
    const options = leagues.map((league) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(league.name)
        .setDescription(`${league.game_code} ${league.season} : ${league.name}`)
        .setValue(league.league_key)
    );

    // build select menu of leagues
    const select = new StringSelectMenuBuilder()
      .setCustomId('league')
      .setPlaceholder('Make a selection!')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);

    const resp = await interaction.reply({
      content: 'Choose a league',
      components: [row],
      ephemeral: true,
    });

    // wait for a selection
    try {
      const selection = await resp.awaitMessageComponent({ time: 60_000 });
      const selectedLeague = leagues.find((x) => x.league_key == selection.values[0]);
      await selection.update({
        content: `${selectedLeague.name} selected`,
        components: [],
      });

      // store selection
      await upsertLeague(interaction.guildId, selectedLeague.league_key);
      cache[LEAGUE_KEY] = selectedLeague.league_key;
    } catch (error) {
      console.log(error);
      await interaction.editReply({
        content: 'Selection not received within 1 minute, cancelling',
        components: [],
      });
    }
  },
};
