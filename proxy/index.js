const site = (new URLSearchParams(window.location.search)).get('url');
const siteOrigin = new URL(site).hostname;

const load = async () => {
  document.writeln(await (await fetch(site)).text());
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