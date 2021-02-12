export const ConnectToFrame = (frame) => {
  frame.src = `https://corsframe.github.io/?url=${encodeURIComponent(frame.src)}`;
  return new Proxy({}, {
    get(target, name, receiver) {
      if (name == 'inject') return (code) => {
        frame.contentWindow.postMessage({
          type: 'eval_code',
          data: typeof code == 'string' ? code : code.toString()
        }, '*');
      }
      return frame[name];
    },
    set(target, name, value, receiver) {
      return frame[name] = value;
    },
  });
}