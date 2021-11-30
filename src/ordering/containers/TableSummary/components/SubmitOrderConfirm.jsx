import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  submitSubOrders as submitSubOrdersThunk,
  updateSubmitOrderConfirmDisplay as updateSubmitOrderConfirmDisplayThunk,
} from '../redux/thunks';

import { getOrderSubmissionPendingStatus, getSubmitOrderConfirmDisplayStatus } from '../redux/selector';
import PageProcessingLoader from '../../../components/PageProcessingLoader';
import Modal from '../../../../components/Modal';

function SubmitOrderConfirm({
  displaySubmitOrderConfirm,
  updateSubmitOrderConfirmDisplay,
  processing,
  submitSubOrders,
  onSubmitOrder,
}) {
  const { t } = useTranslation('OrderingDelivery');

  const handleToggleModal = useCallback(
    status => {
      updateSubmitOrderConfirmDisplay(status);
    },
    [updateSubmitOrderConfirmDisplay]
  );

  if (!displaySubmitOrderConfirm) {
    return null;
  }

  return (
    <>
      <Modal className="submit-order-confirm" show={displaySubmitOrderConfirm}>
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
            onClick={() => {
              submitSubOrders();
              onSubmitOrder();
            }}
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
  displaySubmitOrderConfirm: PropTypes.bool,
  updateSubmitOrderConfirmDisplay: PropTypes.func,
  processing: PropTypes.bool,
  submitSubOrders: PropTypes.func,
  onSubmitOrder: PropTypes.func,
};

SubmitOrderConfirm.defaultProps = {
  displaySubmitOrderConfirm: false,
  updateSubmitOrderConfirmDisplay: () => {},
  processing: false,
  submitSubOrders: () => {},
  onSubmitOrder: () => {},
};

export default connect(
  state => ({
    displaySubmitOrderConfirm: getSubmitOrderConfirmDisplayStatus(state),
    processing: getOrderSubmissionPendingStatus(state),
  }),
  {
    submitSubOrders: submitSubOrdersThunk,
    updateSubmitOrderConfirmDisplay: updateSubmitOrderConfirmDisplayThunk,
  }
)(SubmitOrderConfirm);
