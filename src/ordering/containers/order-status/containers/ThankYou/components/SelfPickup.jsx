import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Constants from '../../../../../../utils/constants';

import { updateOrderShippingType as updateOrderShippingTypeThunk } from '../redux/thunks';
import { getOrder } from '../../../redux/selector';
import { getUpdateShippingTypePendingStatus, getDeliveryUpdatableToSelfPickupState } from '../redux/selector';
import PageProcessingLoader from '../../../../../components/PageProcessingLoader';
import Modal from '../../../../../../components/Modal';
import './SelfPickup.scss';

const { DELIVERY_METHOD } = Constants;

function SelfPickup({
  order,
  processing,
  updatableToSelfPickupStatus,
  updateOrderShippingType,
  onClickSelfPickupButton,
  onChangeToSelfPickup,
}) {
  const { t } = useTranslation('OrderingThankYou');
  const { orderId } = order || {};
  const [modalDisplayState, setModalDisplayState] = useState(false);

  const handleToggleModal = useCallback(status => {
    setModalDisplayState(status);
  }, []);

  if (!updatableToSelfPickupStatus) {
    return null;
  }

  return (
    <section className="self-pickup">
      <div className="card text-center padding-normal margin-small">
        <h2 className="self-pickup__title">{t('SelfPickUpTitle')}</h2>
        <p className="padding-top-bottom-normal padding-left-right-small text-line-height-higher">
          {t('SelfPickUpDescription')}
        </p>
        <button
          className="button button__block button__fill text-uppercase text-weight-bolder"
          data-test-id="ordering.order-status.thank-you.self-pickup.switch-btn"
          onClick={() => {
            onClickSelfPickupButton();
            handleToggleModal(true);
          }}
        >
          {t('SwitchToSelfPickUp')}
        </button>
      </div>
      <Modal className="self-pickup__modal" show={modalDisplayState}>
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
            data-test-id="ordering.order-status.thank-you.self-pickup.cancel-btn"
            onClick={() => handleToggleModal(false)}
          >
            {t('GoBack')}
          </button>
          <button
            className="self-pickup__modal-fill-button button button__fill flex__fluid-content text-weight-bolder text-uppercase"
            data-test-id="ordering.order-status.thank-you.self-pickup.confirm-btn"
            onClick={async () => {
              await updateOrderShippingType({ orderId, shippingType: DELIVERY_METHOD.PICKUP });

              onChangeToSelfPickup();
            }}
          >
            {t('SelfPickUpPromptConfirmedText')}
          </button>
        </Modal.Footer>
      </Modal>
      <PageProcessingLoader show={processing} loaderText={t('Processing')} />
    </section>
  );
}

SelfPickup.displayName = 'SelfPickup';

SelfPickup.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  order: PropTypes.object,
  processing: PropTypes.bool,
  updatableToSelfPickupStatus: PropTypes.bool,
  updateOrderShippingType: PropTypes.func,
  onClickSelfPickupButton: PropTypes.func,
  onChangeToSelfPickup: PropTypes.func,
};

SelfPickup.defaultProps = {
  order: {},
  processing: false,
  updatableToSelfPickupStatus: false,
  updateOrderShippingType: () => {},
  onClickSelfPickupButton: () => {},
  onChangeToSelfPickup: () => {},
};

export default connect(
  state => ({
    order: getOrder(state),
    processing: getUpdateShippingTypePendingStatus(state),
    updatableToSelfPickupStatus: getDeliveryUpdatableToSelfPickupState(state),
  }),
  {
    updateOrderShippingType: updateOrderShippingTypeThunk,
  }
)(SelfPickup);
