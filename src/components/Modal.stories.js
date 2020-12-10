import React from 'react';
import Modal from './Modal';
import '../ordering/containers/Home/components/OfflineStoreModal/OfflineStoreModal.scss';
import '../ordering/containers/Home/OrderingHome.scss';
import '../Common.scss';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Common/Modal',
  component: Modal,
};

export const ModalComponent = () => (
  <div style={{ position: 'relative', height: '100vh' }}>
    <Modal show={true} className="offline-store-modal">
      <Modal.Body className="offline-store-modal__body text-center">
        <h2 className="padding-small text-size-biggest text-weight-bolder">
          {`Store Location A is currently offline`}
        </h2>
        <p className="padding-left-right-smaller margin-small text-size-big">{`Apologies, our store is not ready to go online yet, but we will be back soon! Please try again later.`}</p>
      </Modal.Body>
      <Modal.Footer className="padding-small">
        <button className="button button__fill button__block border-radius-base text-uppercase text-weight-bolder">
          {`Dismiss`}
        </button>
      </Modal.Footer>
    </Modal>
  </div>
);
export const ModalComponentWithHeader = () => (
  <div style={{ position: 'relative', height: '100vh' }}>
    <Modal show={true} className="offline-store-modal">
      <Modal.Header>
        <h1 className="text-weight-bolder text-center">{'OFFLINE'}</h1>
      </Modal.Header>
      <Modal.Body className="offline-store-modal__body text-center">
        <h2 className="padding-small text-size-biggest text-weight-bolder">
          {`Store Location A is currently offline`}
        </h2>
        <p className="padding-left-right-smaller margin-small text-size-big">{`Apologies, our store is not ready to go online yet, but we will be back soon! Please try again later.`}</p>
      </Modal.Body>
      <Modal.Footer className="padding-small">
        <button className="button button__fill button__block border-radius-base text-uppercase text-weight-bolder">
          {`Dismiss`}
        </button>
      </Modal.Footer>
    </Modal>
  </div>
);
