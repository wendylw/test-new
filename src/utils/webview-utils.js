import Utils from './utils';

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

const getAddressFromNative = () => {
  try {
    if (Utils.isAndroidWebview()) {
      return JSON.parse(window.androidInterface.getAddress());
    }
    if (Utils.isIOSWebview()) {
      return JSON.parse(window.prompt('getAddress'));
    }
  } catch {
    return new Error('Failed to get address from native ');
  }
};

export const getLoginStatusFromNative = () => {
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

const hasNativeSavedAddress = () => {
  if (Utils.isWebview() && sessionStorage.getItem('addressIdFromNative')) {
    return true;
  } else {
    return false;
  }
};

export default { getAddressFromNative, getLoginStatusFromNative, hasNativeSavedAddress };
