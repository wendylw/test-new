import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import PageProcessingLoader from '../../../components/PageProcessingLoader';
import Modal from '../../../../components/Modal';

function SubmitOrderConfirm({ modalDisplay }) {
  const { t } = useTranslation('OrderingDelivery');

  return (
    <>
      <Modal className="submit-order-confirm" show={modalDisplay}>
        <Modal.Body className="text-center padding-small">
          <h2 className="padding-small text-size-biggest text-line-height-base text-weight-bolder text-capitalize">
            {t('PayNow')}
          </h2>
          <p className="submit-order-confirm__description padding-small text-size-big text-line-height-higher">
            {t('SubmitOrderPromptDescription')}
          </p>
        </Modal.Body>
        <Modal.Footer className="flex flex-stretch">
          <button
            className="submit-order-confirm__default-button button button__link flex__fluid-content text-weight-bolder text-uppercase"
            onClick={() => {}}
          >
            {t('GoBack')}
          </button>
          <button
            className="submit-order-confirm__fill-button button button__fill flex__fluid-content text-weight-bolder text-uppercase"
            onClick={() => {}}
          >
            {t('PayNow')}
          </button>
        </Modal.Footer>
      </Modal>
      <PageProcessingLoader show={false} loaderText={t('Processing')} />
    </>
  );
}

SubmitOrderConfirm.displayName = 'SubmitOrderConfirm';

SubmitOrderConfirm.propTypes = {
  modalDisplay: PropTypes.bool,
};

SubmitOrderConfirm.defaultProps = {
  modalDisplay: false,
};

export default SubmitOrderConfirm;
