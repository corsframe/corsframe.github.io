export const ConnectToFrame = (frame) => {
  frame.src = `${window.origin}/?url=${encodeURIComponent(frame.src)}`;
  return new Proxy({}, {
    get(target, name, receiver) {
      if (name == 'eval') return (code) => {
        return frame.contentWindow.eval(`(${code})();`)
      }
      return frame[name];
    },
    set(target, name, value, receiver) {
      return frame[name] = value;
    },
  });
}