import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { compose } from 'redux';
import Constants from '../../../../../../utils/constants';
import beepOrderStatusAccepted from '../../../../../../images/order-status-accepted.gif';
import beepOrderStatusConfirmed from '../../../../../../images/order-status-confirmed.gif';
import beepOrderStatusDelivered from '../../../../../../images/order-status-delivered.gif';
import beepOrderStatusPaid from '../../../../../../images/order-status-paid.gif';
import beepOrderStatusPickedUp from '../../../../../../images/order-status-picked-up.gif';
import beepOrderStatusCancelled from '../../../../../../images/order-status-cancelled.png';
import beepPreOrderSuccessImage from '../../../../../../images/beep-pre-order-success.png';

const { ORDER_STATUS, DELIVERY_METHOD } = Constants;
const STATUS_IMAGES_MAPPING = {
  [ORDER_STATUS.PAID]: beepOrderStatusPaid,
  [ORDER_STATUS.ACCEPTED]: beepOrderStatusAccepted,
  [ORDER_STATUS.CONFIRMED]: beepOrderStatusConfirmed,
  [ORDER_STATUS.LOGISTICS_CONFIRMED]: beepOrderStatusConfirmed,
  [ORDER_STATUS.LOGISTICS_PICKED_UP]: beepOrderStatusPickedUp,
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
  const { t, status, shippingType, storeName, cancelOperator, cancelAmountEl, isPreOrder, inApp } = props;
  const ImageSource =
    shippingType === DELIVERY_METHOD.DELIVERY && !isPreOrder ? STATUS_IMAGES_MAPPING[status] : beepPreOrderSuccessImage;
  const showMapInApp =
    inApp && status === ORDER_STATUS.LOGISTICS_PICKED_UP && shippingType === DELIVERY_METHOD.DELIVERY;

  return (
    <React.Fragment>
      {showMapInApp ? null : (
        <img
          className="ordering-thanks__image padding-normal"
          src={ImageSource}
          alt={`Beep ${status || 'order success'}`}
        />
      )}
      {shippingType !== DELIVERY_METHOD.DELIVERY ? (
        <h2 className="ordering-thanks__page-title text-center text-size-large text-weight-light">{t('ThankYou')}!</h2>
      ) : null}
      {shippingType === DELIVERY_METHOD.PICKUP || shippingType === DELIVERY_METHOD.DINE_IN ? (
        <p className="ordering-thanks__page-description padding-small margin-top-bottom-small text-center text-size-big text-line-height-base">
          {shippingType === DELIVERY_METHOD.PICKUP
            ? `${t('ThankYouForPickingUpForUS')} `
            : `${t('PrepareOrderDescription')} `}
          <span role="img" aria-label="Goofy">
            😋
          </span>
        </p>
      ) : null}
      {shippingType === DELIVERY_METHOD.CANCELLED ? (
        <div className="card text-center margin-normal flex">
          <div className="padding-small text-left">
            <Trans i18nKey={cancelledDescriptionKey[cancelOperator]} ns="OrderingThankYou" storeName={storeName}>
              <h4 className="padding-top-bottom-small text-size-big text-weight-bolder">
                {{ storeName }}
                {cancelAmountEl}
              </h4>
            </Trans>
          </div>
        </div>
      ) : null}
    </React.Fragment>
  );
}

OrderStatusDescription.propTypes = {
  status: PropTypes.string,
  shippingType: PropTypes.string,
  storeName: PropTypes.string,
  cancelOperator: PropTypes.string,
  cancelAmountEl: PropTypes.element,
  isPreOrder: PropTypes.bool,
};

OrderStatusDescription.defaultProps = {
  cancelAmountEl: <span></span>,
  isPreOrder: false,
};

export default compose(withTranslation('OrderingThankYou'))(OrderStatusDescription);
