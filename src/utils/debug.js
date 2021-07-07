/* eslint-disable no-console */
const isDebugEnable = () => {
  try {
    return process.env.NODE_ENV === 'development' || window.document.cookie.indexOf('__DEBUG__') !== -1;
  } catch (e) {
    return false;
  }
};

export default (...args) => {
  if (isDebugEnable()) {
    const currentDate = new Date();

    console.debug(currentDate.toLocaleString());
    console.debug(...args);
  }
};
