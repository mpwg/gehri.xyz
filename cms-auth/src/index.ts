import { OAuthClient } from './oauth';

interface Env {
  GITHUB_OAUTH_ID: string;
  GITHUB_OAUTH_SECRET: string;
  GITHUB_REPO_PRIVATE?: string;
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function createOAuth(env: Env) {
  return new OAuthClient({
    id: env.GITHUB_OAUTH_ID,
    secret: env.GITHUB_OAUTH_SECRET,
    target: {
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
      authorizePath: '/login/oauth/authorize',
    },
  });
}

function callbackScriptResponse(status: string, token: string) {
  return new Response(
    `<html><head><script>
    const receiveMessage = () => {
      window.opener.postMessage('authorization:github:${status}:${JSON.stringify({ token })}', '*');
      window.removeEventListener('message', receiveMessage, false);
    };
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
    </script></head><body><p>Authorizing Decap...</p></body></html>`,
    { headers: { 'Content-Type': 'text/html' } },
  );
}

async function handleAuth(url: URL, env: Env) {
  const provider = url.searchParams.get('provider');
  if (provider !== 'github') {
    return new Response('Invalid provider', { status: 400 });
  }

  const repoIsPrivate = env.GITHUB_REPO_PRIVATE !== undefined && env.GITHUB_REPO_PRIVATE !== '0';
  const repoScope = repoIsPrivate ? 'repo,user' : 'public_repo,user';

  const oauth = createOAuth(env);
  const authorizationUri = oauth.authorizeURL({
    redirect_uri: `https://${url.hostname}/callback?provider=github`,
    scope: repoScope,
    state: randomHex(4),
  });

  return new Response(null, { status: 301, headers: { location: authorizationUri } });
}

async function handleCallback(url: URL, env: Env) {
  const provider = url.searchParams.get('provider');
  if (provider !== 'github') {
    return new Response('Invalid provider', { status: 400 });
  }

  const code = url.searchParams.get('code');
  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const oauth = createOAuth(env);
  const accessToken = await oauth.getToken({
    code,
    redirect_uri: `https://${url.hostname}/callback?provider=github`,
  });

  return callbackScriptResponse('success', accessToken);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      return handleAuth(url, env);
    }

    if (url.pathname === '/callback') {
      try {
        return await handleCallback(url, env);
      } catch (error) {
        return new Response(`OAuth callback failed: ${String(error)}`, { status: 500 });
      }
    }

    return new Response('cms-auth worker is running');
  },
};
