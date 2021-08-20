import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Constants from '../../../../../../utils/constants';
import { ORDER_DELAY_REASON_CODES } from '../constants';
import { getDeliverySwitchedToSelfPickupState, getOrderStoreName } from '../redux/selector';
import orderStatusAccepted from '../../../../../../images/order-status-accepted.gif';
import orderStatusConfirmed from '../../../../../../images/order-status-confirmed.gif';
import orderStatusDelivered from '../../../../../../images/order-status-delivered.gif';
import orderStatusPaid from '../../../../../../images/order-status-paid.gif';
import orderStatusPickedUp from '../../../../../../images/order-status-picked-up.gif';
import orderStatusPickedUpRainy from '../../../../../../images/order-status-picked-up-rainy.gif';
import orderStatusCancelled from '../../../../../../images/order-status-cancelled.png';
import orderSuccessImage from '../../../../../../images/order-success.png';

const { ORDER_STATUS, DELIVERY_METHOD } = Constants;
const RAINY_IMAGES_MAPPING = {
  [ORDER_STATUS.CONFIRMED]: orderStatusPickedUpRainy,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: orderStatusPickedUpRainy,
  [ORDER_STATUS.PICKED_UP]: orderStatusPickedUpRainy,
};
const STATUS_IMAGES_MAPPING = {
  [ORDER_STATUS.PAID]: orderStatusPaid,
  [ORDER_STATUS.ACCEPTED]: orderStatusAccepted,
  [ORDER_STATUS.CONFIRMED]: orderStatusConfirmed,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: orderStatusConfirmed,
  [ORDER_STATUS.PICKED_UP]: orderStatusPickedUp,
  [ORDER_STATUS.DELIVERED]: orderStatusDelivered,
  [ORDER_STATUS.CANCELLED]: orderStatusCancelled,
};
const cancelledDescriptionKey = {
  ist: 'ISTCancelledDescription',
  auto_cancelled: 'AutoCancelledDescription',
  merchant: 'MerchantCancelledDescription',
  customer: 'CustomerCancelledDescription',
  unknown: 'UnknownCancelledDescription',
};

function OrderStatusDescription(props) {
  const {
    t,
    orderStatus,
    orderDelayReason,
    shippingType,
    cancelOperator,
    isPreOrder,
    storeName,
    deliveryToSelfPickup,
    cancelAmountEl,
    inApp,
  } = props;
  const delayByBadWeatherImageSource =
    orderDelayReason === ORDER_DELAY_REASON_CODES.BAD_WEATHER ? RAINY_IMAGES_MAPPING[orderStatus] : null;
  const preOrderPendingRiderConfirm =
    shippingType === DELIVERY_METHOD.DELIVERY &&
    isPreOrder &&
    [ORDER_STATUS.PAID, ORDER_STATUS.ACCEPTED].includes(orderStatus);
  const ImageSource =
    preOrderPendingRiderConfirm || shippingType !== DELIVERY_METHOD.DELIVERY
      ? orderSuccessImage
      : STATUS_IMAGES_MAPPING[orderStatus];
  const showMapInApp = inApp && orderStatus === ORDER_STATUS.PICKED_UP && shippingType === DELIVERY_METHOD.DELIVERY;
  const pickUpDescription = deliveryToSelfPickup
    ? t('ThankYouForUpdatedToPickingUpForUS')
    : t('ThankYouForPickingUpForUS');

  return (
    <>
      {showMapInApp || (!ImageSource && !delayByBadWeatherImageSource) ? null : (
        <img
          className="ordering-thanks__image padding-small"
          src={delayByBadWeatherImageSource || ImageSource}
          alt={`Beep ${orderStatus || 'order success'}`}
        />
      )}
      {shippingType !== DELIVERY_METHOD.DELIVERY ? (
        <h2 className="ordering-thanks__page-title text-center padding-left-right-small text-size-large text-weight-light">
          {t('ThankYou')}!
        </h2>
      ) : null}
      {shippingType === DELIVERY_METHOD.PICKUP || shippingType === DELIVERY_METHOD.DINE_IN ? (
        <p className="ordering-thanks__page-description padding-small text-center text-size-big text-line-height-base">
          {shippingType === DELIVERY_METHOD.PICKUP ? `${pickUpDescription} ` : `${t('PrepareOrderDescription')} `}
          <span role="img" aria-label="Goofy">
            😋
          </span>
        </p>
      ) : null}
      {orderStatus === ORDER_STATUS.CANCELLED ? (
        <div className="card text-center margin-normal flex">
          <div className="padding-small text-left">
            <Trans i18nKey={cancelledDescriptionKey[cancelOperator]} ns="OrderingThankYou" storeName={storeName}>
              <p className="padding-top-bottom-small padding-left-right-normal text-center text-size-big text-line-height-base">
                <strong>{{ storeName }}</strong>
                {cancelAmountEl}
              </p>
            </Trans>
          </div>
        </div>
      ) : null}
    </>
  );
}

OrderStatusDescription.displayName = 'OrderStatusDescription';

OrderStatusDescription.propTypes = {
  orderStatus: PropTypes.oneOf(Object.values(ORDER_STATUS)),
  shippingType: PropTypes.oneOf(Object.values(DELIVERY_METHOD)),
  orderDelayReason: PropTypes.oneOf(Object.values(ORDER_DELAY_REASON_CODES)),
  cancelOperator: PropTypes.string,
  isPreOrder: PropTypes.bool,
  deliveryToSelfPickup: PropTypes.bool,
  storeName: PropTypes.string,
  cancelAmountEl: PropTypes.element,
  inApp: PropTypes.bool,
};

OrderStatusDescription.defaultProps = {
  orderStatus: null,
  shippingType: null,
  orderDelayReason: null,
  cancelOperator: null,
  isPreOrder: false,
  deliveryToSelfPickup: false,
  storeName: null,
  cancelAmountEl: <span />,
  inApp: false,
};

export default compose(
  withTranslation('OrderingThankYou'),
  connect(state => ({
    deliveryToSelfPickup: getDeliverySwitchedToSelfPickupState(state),
    storeName: getOrderStoreName(state),
  }))
)(OrderStatusDescription);
