import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions as paymentActions } from '../redux/common/index';
import { getPayByCashPromptDisplayStatus } from '../redux/common/selectors';
import Modal from '../../../../components/Modal';
import PageProcessingLoader from '../../../components/PageProcessingLoader';

function PayByCash({ modalDisplay, updatePayByCashPromptDisplayStatus, onPayWithCash, loading }) {
  const { t } = useTranslation('OrderingPayment');
  const handleToggleModal = useCallback(
    status => {
      updatePayByCashPromptDisplayStatus({ status });
    },
    [updatePayByCashPromptDisplayStatus]
  );

  return (
    <>
      <Modal className="payment-item-prompt" show={modalDisplay}>
        <Modal.Body className="text-center padding-small">
          <h2 className="padding-small text-size-biggest text-line-height-base text-weight-bolder">{t('Cash')}</h2>
          <p className="payment-item-prompt__description padding-small text-size-big text-line-height-higher">
            {t('PayByCashPromptDescription')}
          </p>
        </Modal.Body>
        <Modal.Footer className="flex flex-stretch">
          <button
            className="payment-item-prompt__default-button button button__link flex__fluid-content text-weight-bolder text-uppercase"
            data-test-id="ordering.payments.pay-by-cash.back-btn"
            onClick={() => handleToggleModal(false)}
          >
            {t('GoBack')}
          </button>
          <button
            className="payment-item-prompt__fill-button button button__fill flex__fluid-content text-weight-bolder text-uppercase"
            data-test-id="ordering.payments.pay-by-cash.confirm-btn"
            onClick={() => {
              handleToggleModal(false);
              onPayWithCash();
            }}
          >
            {t('PayByCashPromptConfirmedText')}
          </button>
        </Modal.Footer>
      </Modal>
      <PageProcessingLoader show={loading} loaderText={t('Processing')} />
    </>
  );
}

PayByCash.displayName = 'PayByCash';

PayByCash.propTypes = {
  modalDisplay: PropTypes.bool,
  onPayWithCash: PropTypes.func,
  updatePayByCashPromptDisplayStatus: PropTypes.func,
  loading: PropTypes.bool,
};

PayByCash.defaultProps = {
  modalDisplay: false,
  onPayWithCash: () => {},
  updatePayByCashPromptDisplayStatus: () => {},
  loading: false,
};

export default connect(
  state => ({
    modalDisplay: getPayByCashPromptDisplayStatus(state),
  }),
  {
    updatePayByCashPromptDisplayStatus: paymentActions.updatePayByCashPromptDisplayStatus,
  }
)(PayByCash);
