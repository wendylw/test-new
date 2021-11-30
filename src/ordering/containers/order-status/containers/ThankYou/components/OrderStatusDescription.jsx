import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import Constants from '../../../../../../utils/constants';
import { ORDER_DELAY_REASON_CODES } from '../constants';
import { ORDER_PAYMENT_METHODS } from '../../../constants';
import {
  getOrderStatus,
  getOrderDelayReason,
  getOrderShippingType,
  getIsPreOrder,
  getCancelOperator,
} from '../../../redux/selector';
import { getDeliverySwitchedToSelfPickupState, getOrderStoreName, getOrderPaymentMethod } from '../redux/selector';
import orderStatusAccepted from '../../../../../../images/order-status-accepted.gif';
import orderStatusConfirmed from '../../../../../../images/order-status-confirmed.gif';
import orderStatusDelivered from '../../../../../../images/order-status-delivered.gif';
import orderStatusPaid from '../../../../../../images/order-status-paid.gif';
import orderStatusPickedUp from '../../../../../../images/order-status-picked-up.gif';
import orderStatusPendingPayment from '../../../../../../images/order-status-pending-payment.gif';
import orderStatusPickedUpRainy from '../../../../../../images/order-status-picked-up-rainy.gif';
import orderStatusCancelled from '../../../../../../images/order-status-payment-cancelled.png';
import orderSuccessImage from '../../../../../../images/order-success.png';

const { ORDER_STATUS, DELIVERY_METHOD } = Constants;
const RAINY_IMAGES_MAPPING = {
  [ORDER_STATUS.CONFIRMED]: orderStatusPickedUpRainy,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: orderStatusPickedUpRainy,
  [ORDER_STATUS.PICKED_UP]: orderStatusPickedUpRainy,
};
const DELIVERY_STATUS_IMAGES_MAPPING = {
  [ORDER_STATUS.PAID]: orderStatusPaid,
  [ORDER_STATUS.ACCEPTED]: orderStatusAccepted,
  [ORDER_STATUS.CONFIRMED]: orderStatusConfirmed,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: orderStatusConfirmed,
  [ORDER_STATUS.PICKED_UP]: orderStatusPickedUp,
  [ORDER_STATUS.DELIVERED]: orderStatusDelivered,
  [ORDER_STATUS.CANCELLED]: orderStatusCancelled,
};
const NOT_DELIVERY_STATUS_IMAGES_MAPPING = {
  [ORDER_STATUS.PENDING_PAYMENT]: orderStatusPendingPayment,
  [ORDER_STATUS.PAID]: orderSuccessImage,
  [ORDER_STATUS.ACCEPTED]: orderSuccessImage,
  [ORDER_STATUS.CONFIRMED]: orderSuccessImage,
  [ORDER_STATUS.PICKED_UP]: orderStatusDelivered,
  [ORDER_STATUS.CANCELLED]: orderStatusCancelled,
  [ORDER_STATUS.PAYMENT_CANCELLED]: orderStatusCancelled,
};
const getNotDeliveryTitleAndDescription = (orderStatus, shippingType, paymentMethod, deliveryToSelfPickup) => {
  if (orderStatus === ORDER_STATUS.PAYMENT_CANCELLED) {
    return {
      titleKey: 'SessionExpired',
      descriptionKey: 'PaymentCancelledDescription',
      emoji: null,
    };
  }

  if (paymentMethod === ORDER_PAYMENT_METHODS.OFFLINE && orderStatus === ORDER_STATUS.PENDING_PAYMENT) {
    return {
      titleKey: 'PayAtCounter',
      descriptionKey: 'PendingPaymentDescription',
      emoji: null,
    };
  }

  if (shippingType === DELIVERY_METHOD.PICKUP) {
    return {
      titleKey: 'ThankYou',
      descriptionKey: deliveryToSelfPickup ? 'ThankYouForUpdatedToPickingUpForUS' : 'ThankYouForPickingUpForUS',
      emoji: (
        <span role="img" aria-label="Goofy">
          😋
        </span>
      ),
    };
  }

  return {
    titleKey: 'ThankYou',
    descriptionKey: 'PrepareOrderDescription',
    emoji: (
      <span role="img" aria-label="Goofy">
        😋
      </span>
    ),
  };
};
const CANCELLED_DESCRIPTION_TRANSLATION_KEYS = {
  ist: 'ISTCancelledDescription',
  auto_cancelled: 'AutoCancelledDescription',
  merchant: 'MerchantCancelledDescription',
  customer: 'CustomerCancelledDescription',
  unknown: 'UnknownCancelledDescription',
};

function OrderStatusDescription(props) {
  const { t } = useTranslation('OrderingThankYou');
  const {
    orderStatus,
    orderDelayReason,
    shippingType,
    cancelOperator,
    isPreOrder,
    storeName,
    paymentMethod,
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
      ? NOT_DELIVERY_STATUS_IMAGES_MAPPING[orderStatus]
      : DELIVERY_STATUS_IMAGES_MAPPING[orderStatus];
  const showMapInApp = inApp && orderStatus === ORDER_STATUS.PICKED_UP && shippingType === DELIVERY_METHOD.DELIVERY;
  const titleAndDescription = getNotDeliveryTitleAndDescription(
    orderStatus,
    shippingType,
    paymentMethod,
    deliveryToSelfPickup
  );

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
        <>
          <h2 className="ordering-thanks__page-title text-center padding-left-right-small text-size-large text-weight-light">
            {t(titleAndDescription.titleKey)}!
          </h2>
          <p className="ordering-thanks__page-description padding-small text-center text-size-big text-line-height-base">
            {t(titleAndDescription.descriptionKey)}
            {titleAndDescription.emoji}
          </p>
        </>
      ) : null}
      {orderStatus === ORDER_STATUS.CANCELLED ? (
        <div className="card text-center margin-small flex">
          <div className="padding-small text-left">
            <Trans
              i18nKey={CANCELLED_DESCRIPTION_TRANSLATION_KEYS[cancelOperator || 'unknown']}
              ns="OrderingThankYou"
              storeName={storeName}
            >
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
  cancelOperator: PropTypes.oneOf(Object.keys(CANCELLED_DESCRIPTION_TRANSLATION_KEYS)),
  isPreOrder: PropTypes.bool,
  deliveryToSelfPickup: PropTypes.bool,
  storeName: PropTypes.string,
  paymentMethod: PropTypes.string,
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
  paymentMethod: null,
  cancelAmountEl: <span />,
  inApp: false,
};

export default connect(state => ({
  orderStatus: getOrderStatus(state),
  shippingType: getOrderShippingType(state),
  orderDelayReason: getOrderDelayReason(state),
  cancelOperator: getCancelOperator(state),
  isPreOrder: getIsPreOrder(state),
  deliveryToSelfPickup: getDeliverySwitchedToSelfPickupState(state),
  storeName: getOrderStoreName(state),
  paymentMethod: getOrderPaymentMethod(state),
}))(OrderStatusDescription);
