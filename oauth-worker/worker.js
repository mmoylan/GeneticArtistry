// Minimal GitHub OAuth proxy for Sveltia CMS, for Cloudflare Workers.
// Routes:  /auth      -> sends the editor to GitHub to approve access
//          /callback  -> exchanges the code for a token and hands it to the CMS window
// Secrets (set with `wrangler secret put`): GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
// Variable (wrangler.toml): ALLOWED_ORIGIN = https://your-domain (the site that hosts /admin)

const enc = (s) => JSON.stringify(s);

function page(origin, status, payload) {
  // Sveltia/Decap handshake: tell the opener we're here, wait for its reply, then post the result.
  const msg = `authorization:github:${status}:${enc(payload)}`;
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Signing in…</title><body><script>
(function () {
  var msg = ${enc(msg)};
  var origin = ${enc(origin)};
  window.addEventListener('message', function (e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(msg, e.origin);
    window.close();
  });
  window.opener.postMessage('authorizing:github', origin);
})();
</script><p>Signing in… you can close this window.</p>`,
    { headers: { 'content-type': 'text/html; charset=utf-8', 'set-cookie': 'ga_state=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax' } },
  );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN;

    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const gh = new URL('https://github.com/login/oauth/authorize');
      gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      gh.searchParams.set('redirect_uri', `${url.origin}/callback`);
      gh.searchParams.set('scope', 'repo,user');
      gh.searchParams.set('state', state);
      return new Response(null, {
        status: 302,
        headers: { location: gh.toString(), 'set-cookie': `ga_state=${state}; Max-Age=600; Path=/; Secure; HttpOnly; SameSite=Lax` },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const cookie = (request.headers.get('cookie') || '').match(/ga_state=([^;]+)/)?.[1];
      if (!code || !state || state !== cookie) return page(origin, 'error', { message: 'Invalid or expired login attempt.' });

      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
      });
      const data = await res.json();
      if (!data.access_token) return page(origin, 'error', { message: data.error_description || 'GitHub did not return a token.' });
      return page(origin, 'success', { token: data.access_token, provider: 'github' });
    }

    return new Response('Genetic Artistry CMS auth', { status: 200 });
  },
};
