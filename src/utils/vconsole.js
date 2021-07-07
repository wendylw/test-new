export const enableVConsole = () => {
  if (!window.VConsole) {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js';
    script.onload = () => {
      window.vConsoleInstance = new window.VConsole();
    };
    document.body.appendChild(script);
  }
};

export const disableVConsole = () => {
  if (window.vConsoleInstance) {
    window.vConsoleInstance.destroy();
  }
};

export const initVConsoleIfNecessary = () => {
  // We can check from cookie, localStorage, etc. in the future.
  if (process.env.REACT_APP_ENABLE_VCONSOLE === 'true') {
    enableVConsole();
  }
};
