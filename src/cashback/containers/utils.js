import Utils from '../../utils/utils';

export const getAppLoginStatus = () => {
  if (Utils.isAndroidWebview()) {
    return window.androidInterface.isLogin();
  } else if (Utils.isIOSWebview()) {
    try {
      let iosLoginStr = window.prompt('isLogin');
      return JSON.parse(iosLoginStr);
    } catch (e) {
      console.error('Get login status from app is failed');
      return false;
    }
  } else {
    return false;
  }
};

export const getAppToken = user => {
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

const setCookie = (cname, cvalue, exdays) => {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + '; ' + expires;
};

export const clearCookie = name => {
  setCookie(name, '', -1);
};
