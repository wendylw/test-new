/* eslint-disable react/jsx-props-no-spreading */
import qs from 'qs';
import _difference from 'lodash/difference';
import React, { Component } from 'react';
import uniqueId from 'lodash/uniqueId';

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
  const modalIdSet = getModalIdsFromHash();
  if (modalIdSet.has(modalId)) {
    preventHashPoppedId = modalId;
    window.history.go(-1);
  }
};

window.addEventListener(
  'hashchange',
  e => {
    e.preventDefault();
    const { newURL, oldURL } = e;
    const newModalIds = Array.from(getModalIdsFromHash(new URL(newURL).hash));
    const oldModalIds = Array.from(getModalIdsFromHash(new URL(oldURL).hash));
    const poppedModalIds = _difference(oldModalIds, newModalIds);
    poppedModalIds.forEach(modalId => {
      if (modalId === preventHashPoppedId) {
        preventHashPoppedId = null;
        return;
      }
      window.dispatchEvent(new CustomEvent('sh-modal-history-back', { detail: { modalId } }));
    });
  },
  false
);

export const withBackButtonSupport = WrappedComponent => {
  class WithBackButtonSupport extends Component {
    modalId = uniqueId();

    childRef = React.createRef();

    componentDidMount() {
      window.addEventListener('sh-modal-history-back', this.onBack);
    }

    componentWillUnmount() {
      window.removeEventListener('sh-modal-history-back', this.onBack);
    }

    onBack = e => {
      const { modalId } = e.detail;
      if (modalId === this.modalId) {
        const onHistoryBackReceived = this.childRef.current?.onHistoryBackReceived;
        if (onHistoryBackReceived) {
          onHistoryBackReceived();
        } else {
          console.error(
            `onHistoryBackReceived is not defined on component: ${this.childRef.current?.constructor?.displayName}`
          );
        }
      }
    };

    onModalOpen = () => {
      addModalId(this.modalId);
    };

    onModalClose = () => {
      removeModalId(this.modalId);
    };

    render() {
      return (
        <WrappedComponent
          {...this.props}
          ref={this.childRef}
          onModalOpen={this.onModalOpen}
          onModalClose={this.onModalClose}
        />
      );
    }
  }
  WithBackButtonSupport.displayName = 'WithBackButtonSupport';
  return WithBackButtonSupport;
};
