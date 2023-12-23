const { query } = require('./index');

/**
 *  Upserts the league key into the League table
 * @param {string} guildId - guild id (discord server id)
 * @param {string} leagueKey - encrypted refresh token
 * @returns {object} League record
 */
const upsertLeague = async (guildId, leagueKey) => {
  try {
    const upsertQuery = `
    INSERT INTO public."League" (guild_id, league_key, created_at, updated_at)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (guild_id)
    DO UPDATE SET league_key = $2, updated_at = $4
    RETURNING *`;

    const values = [guildId, leagueKey, new Date().toISOString(), new Date().toISOString()];

    const res = await query(upsertQuery, values);
    return res.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const getLeague = async (guildId) => {
  try {
    const getQuery = `
    SELECT * FROM public."League"
    WHERE guild_id = $1`;
    const res = await query(getQuery, [guildId]);

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = { upsertLeague, getLeague };
