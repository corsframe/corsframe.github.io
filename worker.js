self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', async (event) => {
  self.clients.claim();
  (await self.clients.matchAll()).forEach(client => {
    client.postMessage({
      type: 'origin'
    });
  });
});

const getOrigin = url => {
  const hostname = new URL(url).hostname;
  url = url.split(hostname);
  return hostname + url[1].split('/')[0];
};

const inWhiteList = url => {
  const path = new URL(url).pathname;
  return getOrigin(url) == MYORIGIN && [
    // whitelist here
  ].some(item => path.startsWith(item));
};

const MYORIGIN = getOrigin(self.origin);
let siteOrigin = '';
const PROXY = 'https://api.allorigins.win/raw?url=';
const oldFetch = self.fetch;

const cloneRequest = async (request) => {
  const body = await (
    request.headers.get('Content-Type') ?
      request.blob() : Promise.resolve(undefined)
  );
  let url = request.url;
  if (siteOrigin && getOrigin(url) == MYORIGIN) url = url.replace(MYORIGIN, siteOrigin);
  const newRequest = new Request(`${PROXY}${url}`, {
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
  if (!inWhiteList(event.request.url) && event.request.mode != 'navigate') {
    event.respondWith((async () => {
      const req = await cloneRequest(event.request);
      const data = await ((await oldFetch(req)));
      return data;
    })());
  }
});

self.addEventListener('message', message => {
  switch (message.data.type) {
    case 'origin': {
      siteOrigin = message.data.value;
      message.source.postMessage({
        type: 'setup_complete'
      });
      break;
    }
  }
});
