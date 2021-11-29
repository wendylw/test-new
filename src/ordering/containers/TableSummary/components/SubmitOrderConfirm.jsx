import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import PageProcessingLoader from '../../../components/PageProcessingLoader';
import Modal from '../../../../components/Modal';

function SubmitOrderConfirm({ processing }) {
  const { t } = useTranslation('OrderingDelivery');
  const [modalDisplayState, setModalDisplayState] = useState(false);

  const handleToggleModal = useCallback(status => {
    setModalDisplayState(status);
  }, []);

  return (
    <>
      <Modal className="submit-order-confirm" show={modalDisplayState}>
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
            onClick={() => handleToggleModal(false)}
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
      <PageProcessingLoader show={processing} loaderText={t('Processing')} />
    </>
  );
}

SubmitOrderConfirm.displayName = 'SubmitOrderConfirm';

SubmitOrderConfirm.propTypes = {
  processing: PropTypes.bool,
};

SubmitOrderConfirm.defaultProps = {
  processing: false,
};

export default connect(() => ({}), {})(SubmitOrderConfirm);
