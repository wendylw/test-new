import Utils from './utils';

const hasNativeSavedAddress = () => {
  if (Utils.isWebview() && sessionStorage.getItem('addressIdFromNative')) {
    return true;
  } else {
    return false;
  }
};

export const getAppToken = user => {
  const { isExpired } = user || {};
  if (isExpired) {
    DsbridgeContainer.callMethodFromNative(nativeMethods.tokenExpired);
  } else {
    DsbridgeContainer.callMethodFromNative(nativeMethods.getToken);
  }
};

export const getAppLoginStatus = () => {
  const loginStatus = DsbridgeContainer.callMethodFromNative(nativeMethods.getLoginStatus);
  return loginStatus;
};

export default { hasNativeSavedAddress, getAppToken, getAppLoginStatus };
