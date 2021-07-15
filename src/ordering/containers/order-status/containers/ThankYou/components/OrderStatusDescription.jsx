import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { compose } from 'redux';
import Constants from '../../../../../../utils/constants';
import { ORDER_DELAY_REASON_CODES } from '../constants';
import beepOrderStatusAccepted from '../../../../../../images/order-status-accepted.gif';
import beepOrderStatusConfirmed from '../../../../../../images/order-status-confirmed.gif';
import beepOrderStatusDelivered from '../../../../../../images/order-status-delivered.gif';
import beepOrderStatusPaid from '../../../../../../images/order-status-paid.gif';
import beepOrderStatusPickedUp from '../../../../../../images/order-status-picked-up.gif';
import beepOrderStatusPickedUpRainy from '../../../../../../images/order-status-picked-up-rainy.gif';
import beepOrderStatusCancelled from '../../../../../../images/order-status-cancelled.png';
import beepPreOrderSuccessImage from '../../../../../../images/beep-pre-order-success.png';

const { ORDER_STATUS, DELIVERY_METHOD } = Constants;
const RAINY_IMAGES_MAPPING = {
  [ORDER_STATUS.CONFIRMED]: beepOrderStatusPickedUpRainy,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: beepOrderStatusPickedUpRainy,
  [ORDER_STATUS.PICKED_UP]: beepOrderStatusPickedUpRainy,
};
const STATUS_IMAGES_MAPPING = {
  [ORDER_STATUS.PAID]: beepOrderStatusPaid,
  [ORDER_STATUS.ACCEPTED]: beepOrderStatusAccepted,
  [ORDER_STATUS.CONFIRMED]: beepOrderStatusConfirmed,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: beepOrderStatusConfirmed,
  [ORDER_STATUS.PICKED_UP]: beepOrderStatusPickedUp,
  [ORDER_STATUS.DELIVERED]: beepOrderStatusDelivered,
  [ORDER_STATUS.CANCELLED]: beepOrderStatusCancelled,
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
    refundShippingFee,
    storeName,
    cancelOperator,
    cancelAmountEl,
    isPreOrder,
    inApp,
  } = props;
  const delayByBadWeatherImageSource =
    orderDelayReason === ORDER_DELAY_REASON_CODES.BAD_WEATHER ? RAINY_IMAGES_MAPPING[orderStatus] : null;
  const preOrderPendingStoreAccept =
    shippingType === DELIVERY_METHOD.DELIVERY && isPreOrder && orderStatus === ORDER_STATUS.PAID;
  const ImageSource =
    preOrderPendingStoreAccept || shippingType !== DELIVERY_METHOD.DELIVERY
      ? beepPreOrderSuccessImage
      : STATUS_IMAGES_MAPPING[orderStatus];
  const showMapInApp = inApp && orderStatus === ORDER_STATUS.PICKED_UP && shippingType === DELIVERY_METHOD.DELIVERY;
  const pickUpDescription = refundShippingFee
    ? t('ThankYouForUpdatedToPickingUpForUS')
    : t('ThankYouForPickingUpForUS');

  return (
    <>
      {showMapInApp || (!ImageSource && !delayByBadWeatherImageSource) ? null : (
        <img
          className="ordering-thanks__image padding-normal"
          src={delayByBadWeatherImageSource || ImageSource}
          alt={`Beep ${orderStatus || 'order success'}`}
        />
      )}
      {shippingType !== DELIVERY_METHOD.DELIVERY ? (
        <h2 className="ordering-thanks__page-title text-center text-size-large text-weight-light">{t('ThankYou')}!</h2>
      ) : null}
      {shippingType === DELIVERY_METHOD.PICKUP || shippingType === DELIVERY_METHOD.DINE_IN ? (
        <p className="ordering-thanks__page-description padding-small margin-top-bottom-small text-center text-size-big text-line-height-base">
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

OrderStatusDescription.propTypes = {
  orderStatus: PropTypes.oneOf(Object.values(ORDER_STATUS)),
  orderDelayReason: PropTypes.oneOf(Object.values(ORDER_DELAY_REASON_CODES)),
  shippingType: PropTypes.oneOf(Object.values(DELIVERY_METHOD)),
  refundShippingFee: PropTypes.number,
  storeName: PropTypes.string,
  cancelOperator: PropTypes.string,
  cancelAmountEl: PropTypes.element,
  isPreOrder: PropTypes.bool,
  inApp: PropTypes.bool,
};

OrderStatusDescription.defaultProps = {
  orderStatus: null,
  shippingType: null,
  refundShippingFee: 0,
  orderDelayReason: null,
  storeName: null,
  cancelOperator: null,
  cancelAmountEl: <span />,
  isPreOrder: false,
  inApp: false,
};

export default compose(withTranslation('OrderingThankYou'))(OrderStatusDescription);
