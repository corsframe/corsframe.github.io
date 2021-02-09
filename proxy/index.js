const site = (new URLSearchParams(window.location.search)).get('url');
const siteOrigin = new URL(site).hostname;

navigator.serviceWorker.register('./worker.js');

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
      document.body.innerHTML = await (await fetch(site)).text();
      break;
    }
  }
});