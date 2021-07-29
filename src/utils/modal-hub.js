import qs from 'qs';
import _difference from 'lodash/difference';

const parseHash = (hash = document.location.hash) => qs.parse(hash.replace(/^#/, ''));

const getModalIdsFromHash = (hash = document.location.hash) => {
  const hashObj = parseHash(hash);
  const { modal } = hashObj;
  return modal ? new Set(modal.split(',')) : new Set();
};

export const addModalId = modalId => {
  const hashObj = parseHash();
  const modalIdSet = getModalIdsFromHash();
  modalIdSet.add(modalId);
  const newHashObj = { ...hashObj, modal: Array.from(modalIdSet).join(',') };
  if (!newHashObj.modal) {
    delete newHashObj.modal;
  }
  document.location.hash = `#${qs.stringify(newHashObj)}`;
};

let preventHashPoppedId = null;

export const removeModalId = modalId => {
  preventHashPoppedId = modalId;
  window.history.go(-1);
};

window.addEventListener(
  'hashchange',
  e => {
    const { newURL, oldURL } = e;
    const newModalIds = Array.from(getModalIdsFromHash(new URL(newURL).hash));
    const oldModalIds = Array.from(getModalIdsFromHash(new URL(oldURL).hash));
    const poppedModalIds = _difference(oldModalIds, newModalIds);
    poppedModalIds.forEach(modalId => {
      if (modalId === preventHashPoppedId) {
        preventHashPoppedId = null;
        return;
      }
      window.dispatchEvent(new CustomEvent('sh-modal-hash-popped', { detail: { modalId } }));
    });
  },
  false
);

// const push = () => {
//   history.pushState('');
// }

// const onPop = () => {

// }

// const pop = () => {

// }
