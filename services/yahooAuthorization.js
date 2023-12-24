const { Issuer } = require('openid-client');
const dotenv = require('dotenv');

dotenv.config();

const redirectUrl = process.env.AUTH_REDIRECT_URL;

class YahooOidcAuthClient {
  async init() {
    const yahooIssuer = await Issuer.discover('https://api.login.yahoo.com');
    const client = new yahooIssuer.Client({
      client_id:
        'dj0yJmk9dHVabktSeVpldzFxJmQ9WVdrOVlrRlBTRmRqV0c4bWNHbzlNQT09JnM9Y29uc3VtZXJzZWNyZXQmc3Y9MCZ4PWM2',
      client_secret: process.env.YAHOO_CLIENT_SECRET,
      redirect_uris: [`${redirectUrl}/api/callback`],
      response_types: ['code'],
      id_token_signed_response_alg: 'ES256',
      // token_endpoint_auth_method (default "client_secret_basic")
    });

    this.client = client;
  }

  getRedirectUrl() {
    const url = this.client.authorizationUrl({
      scope: 'openid',
    });
    return url;
  }

  async getTokenSet(req) {
    const params = this.client.callbackParams(req);
    const tokenSet = await this.client.callback(`${redirectUrl}/api/callback`, params);

    return tokenSet;
  }

  async getRefreshedTokenSet(refreshToken) {
    const tokenSet = await this.client.refresh(refreshToken);
    console.log('Refreshed and validated tokens');

    return tokenSet;
  }
}

const yahooOidc = new YahooOidcAuthClient();

module.exports = yahooOidc;
