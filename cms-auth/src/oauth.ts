interface OAuthConfig {
  id: string;
  secret: string;
  target: {
    tokenHost: string;
    tokenPath: string;
    authorizePath: string;
  };
}

export class OAuthClient {
  constructor(private clientConfig: OAuthConfig) {}

  authorizeURL(options: { redirect_uri: string; scope: string; state: string }) {
    const { redirect_uri, scope, state } = options;
    const { tokenHost, authorizePath } = this.clientConfig.target;
    return `${tokenHost}${authorizePath}?response_type=code&client_id=${this.clientConfig.id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
  }

  async getToken(options: { code: string; redirect_uri: string }) {
    const { code, redirect_uri } = options;
    const { tokenHost, tokenPath } = this.clientConfig.target;

    const response = await fetch(`${tokenHost}${tokenPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientConfig.id,
        client_secret: this.clientConfig.secret,
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub token exchange failed with status ${response.status}`);
    }

    const json = (await response.json()) as { access_token?: string };
    if (!json.access_token) {
      throw new Error('GitHub token exchange did not return an access token');
    }

    return json.access_token;
  }
}
