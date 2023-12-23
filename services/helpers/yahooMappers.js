const mapGameLeagues = (gameleagues) => {
  const gamesCount = gameleagues.count;
  const games = [];

  for (let i = 0; i < gamesCount; i++) {
    const game = gameleagues[i].game[0];

    const ls = gameleagues[i].game[1].leagues;
    const leagueCount = ls.count;
    const leagues = [];

    for (let j = 0; j < leagueCount; j++) {
      leagues.push(ls[j].league[0]);
    }

    game.leagues = leagues;
    games.push(game);
  }

  return games;
};

module.exports = {
  mapGameLeagues,
};
