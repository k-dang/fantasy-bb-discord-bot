const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  codeBlock,
} = require('discord.js');

const { cache, LEAGUE_KEY } = require('../../services/cache');
const { getTeams, getWeeklyStats, getStatCategories } = require('../../services/yahooService');
const { formatWeeklyStatsHeader, formatWeeklyStatsRow } = require('../../services/helpers/format');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('weeklystats')
    .setDescription('Get weekly yahoo fantasy basketball stats'),
  async execute(interaction) {
    if (!(LEAGUE_KEY in cache)) {
      await interaction.reply('Please select a league first using `/setleague`');
      return;
    }

    // display team ids to select from
    const teams = await getTeams(cache[LEAGUE_KEY]);

    // build options
    const options = teams.map((team) =>
      new StringSelectMenuOptionBuilder()
        .setLabel(team.teamName)
        .setDescription('Team name on yahoo fantasy')
        .setValue(team.teamKey)
    );

    // build select menu
    const select = new StringSelectMenuBuilder()
      .setCustomId('select')
      .setPlaceholder('Make a selection!')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(select);

    const resp = await interaction.reply({
      content: 'Choose a team',
      components: [row],
      ephemeral: true,
    });

    // wait for a selection
    try {
      const selection = await resp.awaitMessageComponent({ time: 60_000 });
      const teamKey = selection.values[0];
      const selectedTeam = teams.find((x) => x.teamKey == teamKey);
      await selection.update({
        content: `${selectedTeam.teamName} selected`,
        components: [],
      });

      const weeklyStats = await getWeeklyStats(teamKey);
      const statCategories = await getStatCategories(cache[LEAGUE_KEY]);

      const order = Object.keys(statCategories);
      const body = [];
      for (const [week, { stats }] of Object.entries(weeklyStats)) {
        const weekRow = [`${parseInt(week) + 1}`];
        const statsMap = stats.reduce((acc, { stat_id, value }) => {
          acc[stat_id] = value;
          return acc;
        }, {});

        order.forEach((statId) => {
          weekRow.push(statsMap[statId]);
        });

        body.push(formatWeeklyStatsRow(weekRow));
      }
      const header =
        `${selectedTeam.teamName} \n` +
        `======================== \n` +
        formatWeeklyStatsHeader(['WEEK', ...Object.values(statCategories)]);
      const message = header + '\n' + body.join('\n');

      await interaction.followUp(codeBlock(message));
    } catch (error) {
      console.log(error);
      await interaction.editReply({
        content: 'Selection not received within 1 minute, cancelling',
        components: [],
      });
    }
  },
};
