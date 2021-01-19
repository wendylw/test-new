export const gotoHome = () => {
  if (window.androidInterface) {
    window.androidInterface.gotoHome();
  } else if (window.webkit) {
    const version = window.beepAppVersion;

    if (version > '1.0.1') {
      window.webkit.messageHandlers.shareAction.postMessage({
        functionName: 'gotoHome',
      });
    } else {
      window.webkit.messageHandlers.shareAction.postMessage('gotoHome');
    }
  }
};
