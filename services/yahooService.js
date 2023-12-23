const { isBefore, parseISO, isSameDay } = require('date-fns');

const {
  getUserGameLeagues,
  getLeagueSettings,
  getTeamMatchups,
  getLeagueTeams,
} = require('../api/yahoo');
const { mapGameLeagues } = require('./helpers/yahooMappers');

/**
 * Retrieves the list of all active games including the leagues
 * @returns {Promise<League[]>} list of active leagues
 */
const getActiveLeagues = async () => {
  const userGames = await getUserGameLeagues();

  const games = mapGameLeagues(userGames);
  const activeGames = games.filter((x) => x.is_game_over === 0);

  if (activeGames.length === 0) {
    return [];
  }

  const activeLeagues = activeGames.flatMap((x) => x.leagues);
  if (activeLeagues.length === 0) {
    return [];
  }

  return activeLeagues;
};

/**
 * Returns the teams for a given league key
 * @param {string} leagueKey yahoo league key
 * @returns {Promise<{teamKey: string, teamName: string}[]>} list of teams
 */
const getTeams = async (leagueKey) => {
  const leagueTeams = await getLeagueTeams(leagueKey);

  return Object.values(leagueTeams)
    .filter((teams) => typeof teams === 'object')
    .map((json) => ({ teamKey: json.team[0][0].team_key, teamName: json.team[0][2].name }));
};

/**
 * Returns a mapping of all the stat categories in a league to their short name
 * abbreviation
 * @param {string} leagueKey yahoo league key
 * @returns {Promise<{string: string}>} dictionary mapping statIds to their abbreviation
 */
const getStatCategories = async (leagueKey) => {
  const settings = await getLeagueSettings(leagueKey);
  const statCategories = settings.stat_categories.stats;

  const mapping = statCategories.reduce((statIdMapping, statCategory) => {
    const statId = statCategory.stat.stat_id;
    const abbreviation = statCategory.stat.abbr;
    statIdMapping[statId] = abbreviation;
    return statIdMapping;
  }, {});

  return mapping;
};

/**
 * Returns the weekly stats for a given team
 * @param {string} teamKey yahoo team key
 * @returns {Promise<{week: string, stats: Object[]}>} list of weekly stats
 */
const getWeeklyStats = async (teamKey) => {
  const matchups = await getTeamMatchups(teamKey);

  // filter out matchups in the future
  const filteredMatchups = Object.fromEntries(
    Object.entries(matchups).filter(([, { matchup }]) => {
      if (matchup?.week_start != undefined) {
        const weekStart = parseISO(matchup.week_start);
        const currentDate = new Date();
        return isBefore(weekStart, currentDate) || isSameDay(weekStart, currentDate);
      }
      return false;
    })
  );

  if (filteredMatchups.length === 0) {
    return [];
  }

  const weeklyStats = Object.values(filteredMatchups).map(({ matchup }) => {
    const matchupTeams = matchup['0'].teams;

    // filter out other teams
    const selectedTeam = Object.fromEntries(
      Object.entries(matchupTeams).filter(([, { team }]) => {
        if (team != undefined) {
          return team[0][0].team_key === teamKey;
        }
        return false;
      })
    );

    return {
      week: selectedTeam['0'].team[1].team_stats.week,
      stats: selectedTeam['0'].team[1].team_stats.stats.map((x) => x.stat),
    };
  });

  return weeklyStats;
};

module.exports = {
  getActiveLeagues,
  getTeams,
  getStatCategories,
  getWeeklyStats,
};
