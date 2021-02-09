self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

const PROXY = 'https://api.allorigins.win/get?url=';
const oldFetch = self.fetch;

const cloneRequest = async (request) => {
  const body = await (
    request.headers.get('Content-Type') ?
      request.blob() : Promise.resolve(undefined)
  );
  const newRequest = new Request(`${PROXY}${request.url}`, {
    method: request.method,
    headers: request.headers,
    body: body,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    integrity: request.integrity,
  });
  return newRequest;
}

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.origin)) {
    event.respondWith((async () => {
      const req = await cloneRequest(event.request);
      const data = (await ((await oldFetch(req)).json()));
      const res = new Response(data.contents, {
        headers: new Headers({ 'Access-Control-Allow-Origin': '*' }),
        status: data.status.http_code
      });
      return res;
    })());
  }
});