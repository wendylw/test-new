import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { ORDER_STATUS, SHIPPING_TYPES } from '../../../../../../common/utils/constants';
import { ORDER_PAYMENT_METHODS } from '../../../constants';
import {
  getOrderStatus,
  getOrderDelayReason,
  getOrderShippingType,
  getIsPreOrder,
  getCancelOperator,
  getIsPayLater,
  getHasOrderTableIdChanged,
} from '../../../redux/selector';
import {
  getDeliverySwitchedToSelfPickupState,
  getOrderStoreName,
  getOrderPaymentMethod,
  getStatusDescriptionImage,
} from '../redux/selector';

const getNotDeliveryTitleAndDescription = (
  orderStatus,
  shippingType,
  paymentMethod,
  deliveryToSelfPickup,
  isPayLater,
  hasOrderTableIdChanged
) => {
  if (orderStatus === ORDER_STATUS.CANCELLED) {
    return {
      titleKey: 'OrderCanceled',
      descriptionKey: 'OrderCancelledDescription',
      emoji: null,
    };
  }

  if (orderStatus === ORDER_STATUS.PAYMENT_CANCELLED) {
    return {
      titleKey: 'SessionExpired',
      descriptionKey: 'OrderCancelledDescription',
      emoji: null,
    };
  }

  if (paymentMethod === ORDER_PAYMENT_METHODS.OFFLINE && orderStatus === ORDER_STATUS.PENDING_PAYMENT) {
    return {
      titleKey: 'PayAtCounter',
      descriptionKey: isPayLater ? 'PendingPaymentDescriptionForPayLater' : 'PendingPaymentDescription',
      emoji: null,
    };
  }

  // WB-5071: if the order table id has been changed then  the order status will be reverted to 'created'
  // However, if the order status is updated we should be able to handle it according to the current process.
  if (hasOrderTableIdChanged && orderStatus === ORDER_STATUS.CREATED) {
    return {
      titleKey: 'TableNumberUpdatedTitle',
      descriptionKey: 'TableNumberUpdatedDescription',
      emoji: null,
    };
  }

  if (shippingType === SHIPPING_TYPES.PICKUP && orderStatus !== ORDER_STATUS.PICKED_UP) {
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

  if (shippingType === SHIPPING_TYPES.PICKUP && orderStatus === ORDER_STATUS.PICKED_UP) {
    return {
      titleKey: 'ThankYou',
      descriptionKey: deliveryToSelfPickup ? 'ThankYouForUpdatedToPickingUpForUS' : 'ThankYouForAlreadyPickUp',
      emoji: (
        <span role="img" aria-label="Goofy">
          😋
        </span>
      ),
    };
  }

  return {
    titleKey: 'ThankYou',
    descriptionKey: isPayLater ? 'HopeYouEnjoyedYourMeal' : 'PrepareOrderDescription',
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
    shippingType,
    cancelOperator,
    storeName,
    paymentMethod,
    deliveryToSelfPickup,
    cancelAmountEl,
    isPayLater,
    hasOrderTableIdChanged,
    statusDescriptionImage,
  } = props;
  const titleAndDescription = getNotDeliveryTitleAndDescription(
    orderStatus,
    shippingType,
    paymentMethod,
    deliveryToSelfPickup,
    isPayLater,
    hasOrderTableIdChanged
  );

  return (
    <>
      {statusDescriptionImage ? (
        <img
          className="ordering-thanks__image padding-small"
          src={statusDescriptionImage}
          alt={`Beep ${orderStatus || 'order success'}`}
        />
      ) : null}
      {shippingType !== SHIPPING_TYPES.DELIVERY ? (
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
  shippingType: PropTypes.oneOf(Object.values(SHIPPING_TYPES)),
  cancelOperator: PropTypes.oneOf(Object.keys(CANCELLED_DESCRIPTION_TRANSLATION_KEYS)),
  deliveryToSelfPickup: PropTypes.bool,
  storeName: PropTypes.string,
  paymentMethod: PropTypes.string,
  cancelAmountEl: PropTypes.element,
  isPayLater: PropTypes.bool,
  hasOrderTableIdChanged: PropTypes.bool,
  statusDescriptionImage: PropTypes.string,
};

OrderStatusDescription.defaultProps = {
  orderStatus: null,
  shippingType: null,
  cancelOperator: null,
  deliveryToSelfPickup: false,
  storeName: null,
  paymentMethod: null,
  cancelAmountEl: <span />,
  isPayLater: false,
  hasOrderTableIdChanged: false,
  statusDescriptionImage: null,
};

export default connect(state => ({
  statusDescriptionImage: getStatusDescriptionImage(state),
  orderStatus: getOrderStatus(state),
  shippingType: getOrderShippingType(state),
  orderDelayReason: getOrderDelayReason(state),
  cancelOperator: getCancelOperator(state),
  isPreOrder: getIsPreOrder(state),
  deliveryToSelfPickup: getDeliverySwitchedToSelfPickupState(state),
  storeName: getOrderStoreName(state),
  paymentMethod: getOrderPaymentMethod(state),
  isPayLater: getIsPayLater(state),
  hasOrderTableIdChanged: getHasOrderTableIdChanged(state),
}))(OrderStatusDescription);
