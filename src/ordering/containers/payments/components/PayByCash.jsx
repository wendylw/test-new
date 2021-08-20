import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Utils from '../../../../utils/utils';
import { createOrder as createOrderThunk } from '../redux/common/thunks';
import { actions as paymentActions } from '../redux/common/index';
import { getTotalCashbackFromCartBilling, getPayByCashPromptDisplayStatus } from '../redux/common/selectors';
import PageProcessingLoader from '../../../components/PageProcessingLoader';
import Modal from '../../../../components/Modal';

function PayByCash({ modalDisplay, cashback, createOrder, updatePayByCashPromptDisplayStatus, onPayWithCash }) {
  const { t } = useTranslation('OrderingPayment');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const handleToggleModal = useCallback(status => {
    updatePayByCashPromptDisplayStatus({ status });
  }, []);

  // console.log(modalDisplay);

  return (
    <>
      <Modal className="payment-item-prompt" show={modalDisplay}>
        <Modal.Body className="text-center padding-small">
          <h2 className="padding-small text-size-biggest text-line-height-base text-weight-bolder">
            {t('PayAtTheCashier')}
          </h2>
          <p className="payment-item-prompt__description padding-small text-size-big text-line-height-higher">
            {t('PayByCashPromptDescription')}
          </p>
        </Modal.Body>
        <Modal.Footer className="flex flex-stretch">
          <button
            className="payment-item-prompt__default-button button button__link flex__fluid-content text-weight-bolder text-uppercase"
            onClick={() => handleToggleModal(false)}
          >
            {t('GoBack')}
          </button>
          <button
            className="payment-item-prompt__fill-button button button__fill flex__fluid-content text-weight-bolder text-uppercase"
            onClick={async () => {
              setCreatingOrder(true);

              try {
                const shippingType = Utils.getOrderTypeFromUrl();
                const createOrderResult = await createOrder({ cashback, shippingType });
                const { order, redirectUrl: thankYouPageUrl } = createOrderResult || {};
                const { tableId, shippingType: type } = order;

                if (thankYouPageUrl) {
                  onPayWithCash(
                    `${thankYouPageUrl}${tableId ? `&tableId=${tableId}` : ''}${type ? `&type=${type}` : ''}`
                  );
                }
              } catch {
                setCreatingOrder(false);
              }
            }}
          >
            {t('PayByCashPromptConfirmedText')}
          </button>
        </Modal.Footer>
      </Modal>
      <PageProcessingLoader show={creatingOrder} loaderText={t('Processing')} />
    </>
  );
}

PayByCash.displayName = 'PayByCash';

PayByCash.propTypes = {
  modalDisplay: PropTypes.bool,
  cashback: PropTypes.number,
  createOrder: PropTypes.func,
  onPayWithCash: PropTypes.func,
  updatePayByCashPromptDisplayStatus: PropTypes.func,
};

PayByCash.defaultProps = {
  modalDisplay: false,
  cashback: 0,
  createOrder: () => {},
  onPayWithCash: () => {},
  updatePayByCashPromptDisplayStatus: () => {},
};

export default connect(
  state => ({
    modalDisplay: getPayByCashPromptDisplayStatus(state),
    cashback: getTotalCashbackFromCartBilling(state),
  }),
  {
    createOrder: createOrderThunk,
    updatePayByCashPromptDisplayStatus: paymentActions.updatePayByCashPromptDisplay,
  }
)(PayByCash);
