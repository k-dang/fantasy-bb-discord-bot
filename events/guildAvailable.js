const { Events } = require('discord.js');

const { initDb } = require('../db');
const { getLeague } = require('../db/leagueRepository');
const { getAuthentication } = require('../db/authRepository');
const { cache, YAHOO_ACCESS_TOKEN, LEAGUE_KEY } = require('../services/cache');
const yahooOidc = require('../services/yahooAuthorization');

module.exports = {
  name: Events.GuildAvailable,
  once: true,
  async execute(guild) {
    console.log(`Ready in Guild ${guild.id}`);

    // init odic client
    await yahooOidc.init();

    // init database
    await initDb();

    // seed cache when authenticated
    const authentication = await getAuthentication();
    if (authentication != null) {
      cache[YAHOO_ACCESS_TOKEN] = authentication.encrypted_token;
    }

    const league = await getLeague(guild.id);
    if (league != null) {
      cache[LEAGUE_KEY] = league.league_key;
    }
  },
};
