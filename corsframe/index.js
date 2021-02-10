const site = (new URLSearchParams(window.location.search)).get('url');
const siteOrigin = new URL(site).hostname;

const load = async () => {
  document.body.outerHTML = (await (await fetch(site)).text());
  const base = document.createElement('base');
  base.href = window.location.href.split('=')[0] + `=${site}`;
  document.head.appendChild(base);
}

navigator.serviceWorker.addEventListener('message', async message => {
  switch (message.data.type) {
    case 'origin': {
      navigator.serviceWorker.controller.postMessage({
        type: 'origin',
        value: siteOrigin
      });
      break;
    }
    case 'setup_complete': {
      load();
      break;
    }
  }
});
navigator.serviceWorker.register('./worker.js');

if (navigator.serviceWorker.controller) {
  window.addEventListener('load', load);
}