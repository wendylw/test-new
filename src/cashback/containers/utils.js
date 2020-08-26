import Utils from '../../utils/utils';

export const getAppLoginStatus = () => {
  if (Utils.isAndroidWebview()) {
    console.log('appLogin====>', window.androidInterface.isLogin());
    return window.androidInterface.isLogin();
  } else if (Utils.isIOSWebview()) {
    console.log('iosLogin====>', window.prompt('isLogin'));
    return window.prompt('isLogin');
  } else {
    const isIos = Utils.isIOSWebview();
    console.log('isIos====>', isIos);
    return false;
  }
};

export const postAppMessage = user => {
  const { isExpired } = user || {};
  if (Utils.isAndroidWebview() && isExpired) {
    window.androidInterface.tokenExpired();
  }
  if (Utils.isAndroidWebview() && !isExpired) {
    window.androidInterface.getToken();
  }
  if (Utils.isIOSWebview() && isExpired) {
    window.webkit.messageHandlers.shareAction.postMessage({
      functionName: 'tokenExpired',
      callbackName: 'sendToken',
    });
  }
  if (Utils.isIOSWebview() && !isExpired) {
    window.webkit.messageHandlers.shareAction.postMessage({ functionName: 'getToken', callbackName: 'sendToken' });
  }
};
