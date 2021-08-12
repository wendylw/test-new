/* eslint-disable react/jsx-props-no-spreading */
import React, { Component } from 'react';
import qs from 'qs';
import _difference from 'lodash/difference';
import _uniqueId from 'lodash/uniqueId';
import _once from 'lodash/once';

const parseHash = (hash = document.location.hash) => qs.parse(hash.replace(/^#/, ''));

const getModalIdsFromHash = (hash = document.location.hash) => {
  const hashObj = parseHash(hash);
  const { modal } = hashObj;
  return modal ? new Set(modal.split(',')) : new Set();
};

export const addModalIdHash = modalId => {
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

export const removeModalIdHash = modalId => {
  const modalIdSet = getModalIdsFromHash();
  if (modalIdSet.has(modalId)) {
    // removing hash will cause hash change be triggered once more, so we add this flag
    // to prevent redundant sh-modal-history-back dispatched unexpectedly.
    preventHashPoppedId = modalId;
    window.history.go(-1);
  }
};

window.addEventListener(
  'hashchange',
  e => {
    const { newURL, oldURL } = e;
    const newModalIds = Array.from(getModalIdsFromHash(new URL(newURL).hash));
    const oldModalIds = Array.from(getModalIdsFromHash(new URL(oldURL).hash));
    const poppedModalIds = _difference(oldModalIds, newModalIds);
    // poppedModalIds is expected to have no more than one item.
    if (poppedModalIds.length) {
      const modalId = poppedModalIds[0];
      if (modalId === preventHashPoppedId) {
        preventHashPoppedId = null;
        return;
      }
      const keepDefault = window.dispatchEvent(
        new CustomEvent('sh-modal-history-back', { detail: { modalId }, cancelable: true })
      );
      if (!keepDefault) {
        window.history.forward();
      }
    }
  },
  false
);

/**
 * withBackButtonSupport: an HOC to make your modal closable by pressing browser back button
 * Usage:
 * 1. Wrap your component with this HOC.
 * 2. Your component must have a method named `onHistoryBackReceived`, which will be called on
 *    back button pressed. You should implement the logic to close your modal in this method.
 *    If the function returns false, we will restore the hash to simulate the history change
 *    is cancelled.
 * 3. Your component will receive a function as a prop named `onModalVisibilityChanged`, you
 *    should call this method with a parameter `visibility` when the visibility of your modal
 *    has changed. NOTE: Do NOT make redundant call if the visibility isn't actually changed!
 */
export const withBackButtonSupport = WrappedComponent => {
  class WithBackButtonSupport extends Component {
    modalId = _uniqueId();

    childRef = React.createRef();

    componentDidMount() {
      window.addEventListener('sh-modal-history-back', this.onModalHistoryBack);
    }

    componentWillUnmount() {
      window.removeEventListener('sh-modal-history-back', this.onModalHistoryBack);
    }

    onModalHistoryBack = e => {
      const { modalId } = e.detail;
      if (modalId === this.modalId) {
        const onHistoryBackReceived = this.childRef.current?.onHistoryBackReceived;
        if (onHistoryBackReceived) {
          const keepDefault = onHistoryBackReceived() ?? true;
          if (keepDefault === false) {
            e.preventDefault();
          }
        } else {
          console.error(
            `onHistoryBackReceived is not defined on component: ${this.childRef.current?.constructor?.displayName}`
          );
        }
      }
    };

    onModalVisibilityChanged = visibility => {
      if (visibility) {
        addModalIdHash(this.modalId);
      } else {
        removeModalIdHash(this.modalId);
      }
    };

    render() {
      return (
        <WrappedComponent
          {...this.props}
          ref={this.childRef}
          onModalVisibilityChanged={this.onModalVisibilityChanged}
        />
      );
    }
  }
  WithBackButtonSupport.displayName = 'WithBackButtonSupport';
  return WithBackButtonSupport;
};

// Currently we don't support to keep the modal open after the page is refresh,
// to avoid confusion, we will remove the modal hash on page init.
const cleanupModalHashOnPageInit = _once(() => {
  const hashStr = document.location.hash;
  if (hashStr === '' || hashStr === '#') {
    return;
  }
  const hashObj = parseHash(hashStr);
  delete hashObj.modal;
  window.history.replaceState(window.history.state, '', `#${qs.stringify(hashObj)}`);
});

cleanupModalHashOnPageInit();
