/* eslint-disable react/jsx-props-no-spreading */
import React, { Component, useEffect, useCallback } from 'react';
import { useMount, useUnmount, useUpdateEffect } from 'react-use';
import qs from 'qs';
import _difference from 'lodash/difference';
import _uniqueId from 'lodash/uniqueId';
import _once from 'lodash/once';
import logger from './monitoring/logger';
import useRefInitializer from '../common/utils/hooks/useRefInitializer';

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
  // don't use `document.location.hash = `#${qs.stringify(newHashObj)}``, for it causes a weird issue on iOS (BEEP-1011)
  window.history.pushState(window.history.state, '', `#${qs.stringify(newHashObj)}`);
  logger.log('Utils_ModalBackButtonSupport_AddModalIdHash', { id: modalId });
};

let preventHashPoppedId = null;

export const removeModalIdHash = modalId =>
  new Promise(resolve => {
    const modalIdSet = getModalIdsFromHash();
    if (modalIdSet.has(modalId)) {
      // removing hash will cause hash change be triggered once more, so we add this flag
      // to prevent redundant sh-modal-history-back dispatched unexpectedly.
      preventHashPoppedId = modalId;
      // history.go is a async function, so we need to find a way to notice the caller that the url has been changed.
      const onPopState = () => {
        logger.log('Utils_ModalBackButtonSupport_FinishRemoveModalIdHash', { id: modalId });
        window.removeEventListener('popstate', onPopState);
        resolve();
      };
      window.addEventListener('popstate', onPopState);
      logger.log('Utils_ModalBackButtonSupport_StartRemoveModalIdHash', { id: modalId });
      window.history.go(-1);
    } else {
      resolve();
    }
  });
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
        logger.log('Utils_ModalBackButtonSupport_ChangeModalIdFailed', { id: modalId });
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
    constructor() {
      super();
      this.modalId = _uniqueId();
      this.childRef = React.createRef();
    }

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

    onModalVisibilityChanged = async visibility => {
      if (visibility) {
        addModalIdHash(this.modalId);
      } else {
        await removeModalIdHash(this.modalId);
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

/**
 *
 * @param {boolean} visibility whether the modal is visible or not, used to determine whether to add or remove the modal id to the hash
 * @param {function} onHistoryBackReceived called when the use presses the back button, used to notify the modal to close
 * @param {function} onHistoryChangeCompleted called when the hash change is done (because the hash change is async)
 * @param {boolean} disabled the hook will completely not functioning. IMPORTANT NOTE: It's only allowed to set this property on a component is mounted. Do NOT change the value in the rest life cycle of the component.
 * @returns
 */
export const useBackButtonSupport = ({
  visibility,
  onHistoryBackReceived,
  onHistoryChangeCompleted,
  disabled = false, // IMPORTANT NOTE: It's only allowed to set this property on a component is mounted. Do NOT change the value in the rest life cycle of the component.
}) => {
  const modalIdRef = useRefInitializer(() => _uniqueId());
  const onModalHistoryBack = useCallback(
    e => {
      if (disabled) return;
      const { modalId } = e.detail;
      if (modalId === modalIdRef.current) {
        // const onHistoryBackReceived = this.childRef.current?.onHistoryBackReceived;
        if (onHistoryBackReceived) {
          const keepDefault = onHistoryBackReceived() ?? true;
          if (keepDefault === false) {
            e.preventDefault();
          }
        } else {
          console.error(`onHistoryBackReceived is not defined`);
        }
      }
    },
    [onHistoryBackReceived, disabled]
  );

  useEffect(() => {
    window.addEventListener('sh-modal-history-back', onModalHistoryBack);
    return () => {
      window.removeEventListener('sh-modal-history-back', onModalHistoryBack);
    };
  }, [onModalHistoryBack]);

  // if the modal is mounted with visibility = true, we will add hash
  useMount(() => {
    if (disabled) return;
    if (visibility) {
      addModalIdHash(modalIdRef.current);
      onHistoryChangeCompleted && onHistoryChangeCompleted(visibility);
    }
  });

  // This hook is only executed when visibility changes (i.e. It won't be executed when the modal is mount). This is
  // to prevent the onHistoryChangeCompleted is called when the modal is mounted with visibility = false.
  useUpdateEffect(() => {
    const execute = async () => {
      if (disabled) return;
      if (visibility) {
        addModalIdHash(modalIdRef.current);
      } else {
        await removeModalIdHash(modalIdRef.current);
      }
      onHistoryChangeCompleted && onHistoryChangeCompleted(visibility);
    };
    execute();
    // Do NOT add onHistoryChangeCompleted to dependency list, we don't want to re-run the effect when onHistoryChangeCompleted is updated.
    // Otherwise we will get an infinite loop.
  }, [visibility, disabled]);

  // If the modal is unmounted with visibility = true, we still need to remove hash by calling history.go(-1).
  useUnmount(() => {
    const execute = async () => {
      if (disabled) return;
      if (visibility) {
        await removeModalIdHash(modalIdRef.current);
        // Since the modal is unmounted, the visibility param for onHistoryChangeComplete will be false, even if the visibility in props is
        // still true.
        onHistoryChangeCompleted && onHistoryChangeCompleted(false);
      }
    };
    execute();
  });
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
