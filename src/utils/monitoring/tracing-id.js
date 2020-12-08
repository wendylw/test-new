// some browser (like Safari, Firefox) block 3rd party cookies to protect user privacy, but we want to
// inspect user experience more detailedly, so we use first party cookies for tracking.
const cookieArray = document.cookie.split(';').map(entry => entry.trim());
const tidKeys = ['sess_tid', 'perm_tid'];
const tids = {};

try {
  cookieArray.forEach(cookieEntry => {
    tidKeys.forEach(tidKey => {
      if (new RegExp('^' + tidKey + '=').test(cookieEntry)) {
        const tid = cookieEntry.split('=')[1];
        if (tid) {
          tids[tidKey] = tid;
        }
      }
    });
  });
} catch (e) {
  console.log(e);
}

export default tids;
