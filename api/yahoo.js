const axios = require('axios');

const { cache, YAHOO_ACCESS_TOKEN } = require('../services/cache');
const yahooOidc = require('../services/yahooAuthorization');
const { getAuthentication, upsertAuthentication } = require('../db/authRepository');

const instance = axios.create({
  baseURL: 'https://fantasysports.yahooapis.com/fantasy/v2',
});

instance.interceptors.request.use(
  async (config) => {
    config.headers = {
      Authorization: `Bearer ${cache[YAHOO_ACCESS_TOKEN]}`,
    };
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalConfig = error.config;
    if (error.response && error.response.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;

      try {
        // request refresh token
        const authentication = await getAuthentication();
        const tokenSet = await yahooOidc.getRefreshedTokenSet(
          authentication.encrypted_refresh_token
        );

        // save new token set & store in cache
        await upsertAuthentication(tokenSet.access_token, tokenSet.refresh_token);
        cache[YAHOO_ACCESS_TOKEN] = tokenSet.access_token;

        instance.defaults.headers.common['Authorization'] = `Bearer ${tokenSet.access_token}`;
        return instance(originalConfig);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

const getLeagueSettings = async (leagueKey) => {
  try {
    const response = await instance.get(`/league/${leagueKey}/settings`, {
      params: {
        format: 'json',
      },
    });
    return response.data.fantasy_content.league[1].settings[0];
  } catch (e) {
    console.log(e.response.data.error);
    throw new Error(e.message);
  }
};

const getLeagueTeams = async (leagueKey) => {
  try {
    const response = await instance.get(`/league/${leagueKey}/teams`, {
      params: {
        format: 'json',
      },
    });

    return response.data.fantasy_content.league[1].teams;
  } catch (e) {
    console.log(e.response.data.error);
    throw new Error(e.message);
  }
};

const getTeamMatchups = async (teamKey) => {
  try {
    const response = await instance.get(`/team/${teamKey}/matchups`, {
      params: {
        format: 'json',
      },
    });

    return response.data.fantasy_content.team[1].matchups;
  } catch (e) {
    console.log(e.response.data.error);
    throw new Error(e.message);
  }
};

const getUserGameLeagues = async () => {
  try {
    const response = await instance.get('/users;use_login=1/games/leagues', {
      params: {
        format: 'json',
      },
    });

    return response.data.fantasy_content.users[0].user[1].games;
  } catch (e) {
    console.log(e.message);
    throw new Error(e.message);
  }
};

module.exports = { getLeagueSettings, getLeagueTeams, getTeamMatchups, getUserGameLeagues };
