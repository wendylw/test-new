// some browser (like Safari, Firefox) block 3rd party cookies to protect user privacy, but we want to
// inspect user experience more detailedly, so we use first party cookies for tracking.
const cookieArray = document.cookie.split(';').map(entry => entry.trim());
const tidKeys = ['sess_tid', 'perm_tid'];
const tids = {};

try {
  cookieArray.forEach(cookieEntry => {
    tidKeys.forEach(tidKey => {
      if (new RegExp('^' + tidKey + '=').test(cookieEntry)) {
        tids[tidKey] = cookieEntry.split('=')[1];
      }
    });
  });
} catch (e) {
  console.log(e);
}

try {
  Object.keys(tids).forEach(key => {
    const tid = tids[key];
    window.newrelic?.setCustomAttribute(key, tid);
    // todo: heap, gtm, sentry, ..., etc.
  });
} catch (e) {
  console.log(e);
}

export {};
