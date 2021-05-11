import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';

import Loader from '../../../../../components/Loader';
import Modal from '../../../../../../components/Modal';
import './SelfPickup.scss';

function SelfPickup({ t, processing, onChangeSelfPickup }) {
  const [selfPickUpInfo, setSelfPickUpInfo] = useState({
    showModal: false,
  });

  const handleToggleModal = status => {
    setSelfPickUpInfo({
      ...selfPickUpInfo,
      showModal: status,
    });
  };

  return (
    <section className="self-pickup">
      <div className="card text-center padding-normal margin-normal">
        <h2 className="self-pickup__title">{t('SelfPickUpTitle')}</h2>
        <p className="padding-top-bottom-normal padding-left-right-small text-line-height-higher">
          {t('SelfPickUpDescription')}
        </p>
        <button
          className="button button__block button__fill text-uppercase text-weight-bolder"
          onClick={() => handleToggleModal(true)}
        >
          {t('SwitchToSelfPickUp')}
        </button>
      </div>
      <Modal className="self-pickup__modal" show={selfPickUpInfo.showModal}>
        <Modal.Body className="text-center padding-small">
          <h2 className="padding-small text-size-biggest text-line-height-base text-weight-bolder">
            {t('SwitchToSelfPickUp')}
          </h2>
          <p className="self-pickup__modal-description padding-small text-size-big text-line-height-higher">
            {t('SelfPickUpPromptDescription')}
          </p>
        </Modal.Body>
        <Modal.Footer className="flex flex-stretch">
          <button
            className="self-pickup__modal-default-button button button__link flex__fluid-content text-weight-bolder text-uppercase"
            onClick={() => handleToggleModal(false)}
          >
            {t('GoBack')}
          </button>
          <button
            className="self-pickup__modal-fill-button button button__fill flex__fluid-content text-weight-bolder text-uppercase"
            onClick={() => onChangeSelfPickup}
          >
            {t('SelfPickUpPromptConfirmedText')}
          </button>
        </Modal.Footer>
      </Modal>
      <Loader processing={processing} loaderText={t('Processing')} />
    </section>
  );
}

SelfPickup.propTypes = {
  processing: PropTypes.bool,
  onChangeSelfPickup: PropTypes.func,
};

SelfPickup.defaultProps = {
  processing: false,
  onChangeSelfPickup: () => {},
};

export default compose(withTranslation('OrderingThankYou'))(SelfPickup);
