const mainDomain = document.location.hostname
  .split('.')
  .slice(-2)
  .join('.');

// toggle to commented code to toggle devtools. please also toggle the one in index.html

// const getDevtoolsSrc =  () => 'https://unpkg.com/vconsole/dist/vconsole.min.js';
// const initDevtools = () => {
//   window.vConsoleInstance = new window.VConsole();
// };
// const destroyDevtools = () => {
//   window.vConsoleInstance.destroy();
//   delete window.vConsoleInstance;
// };
// const isScriptLoaded = () => !!window.VConsole;
// const isDevToolsInitiated = () => !!window.vConsoleInstance;

const getDevtoolsSrc = () => 'https://cdn.jsdelivr.net/npm/eruda';
const initDevtools = () => window.eruda.init();
const destroyDevtools = () => window.eruda.destroy();
const isScriptLoaded = () => !!window.eruda;
// eslint-disable-next-line no-underscore-dangle
const isDevToolsInitiated = () => !!(window.eruda && window.eruda._isInit === true);

export const toggleDevTools = () => {
  if (isDevToolsInitiated()) {
    destroyDevtools();
    document.cookie = `sh_devtools_enabled=false; expires=${new Date(0).toUTCString()}; domain=${mainDomain}`;
    return;
  }
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 7);
  document.cookie = `sh_devtools_enabled=true; domain=${mainDomain}; expires=${expireDate.toUTCString()}`;
  if (isScriptLoaded()) {
    initDevtools();
  } else {
    const elem = document.createElement('script');
    elem.src = getDevtoolsSrc();
    elem.onload = () => {
      initDevtools();
    };
    document.body.appendChild(elem);
  }
};
