import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import Constants from '../../../../../../utils/constants';
import { formatPickupTime } from '../../../../../../utils/datetime-lib';
import { getBusinessDateTime } from '../../../../../../utils/store-utils';
import Utils from '../../../../../../utils/utils';
import { alert } from '../../../../../../common/feedback';
import {
  getOrderStoreInfo,
  getOrderStatus,
  getIsOrderCancellable,
  getOrderShippingType,
  getIsPreOrder,
  getOrder,
} from '../../../redux/selector';
import { getOrderCancellationButtonVisible, getOrderDeliveryInfo, getOrderStoreName } from '../redux/selector';
import { actions as thankYouActionCreators } from '../redux';
import CurrencyNumber from '../../../../../components/CurrencyNumber';
import { IconAccessTime, IconPin } from '../../../../../../components/Icons';

const { DELIVERY_METHOD, ORDER_STATUS } = Constants;

const PreOrderMessage = ({ expectFrom, expectTo, address }) => {
  const { t } = useTranslation('OrderingThankYou');

  if (!address) {
    return null;
  }

  return (
    <div className="padding-small">
      <h4 className="padding-left-right-small margin-top-bottom-small text-weight-bolder">
        {t('ThanksForOrderingWithUs')}
      </h4>
      <p className="padding-top-bottom-smaller padding-left-right-small text-line-height-base text-opacity">
        {t('PreOrderDeliveryTimeDetails', {
          day: expectFrom.format('dddd, MMMM DD'),
          dayAndTime: `${expectFrom.format('hh:mm A')} - ${expectTo.format('hh:mm A')}`,
          deliveryTo: address,
        })}
      </p>
      <p className="padding-top-bottom-smaller padding-left-right-small text-line-height-base text-opacity">
        {t('PreOrderDeliverySMS')}
      </p>
    </div>
  );
};

PreOrderMessage.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  expectFrom: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  expectTo: PropTypes.object,
  address: PropTypes.string,
};

PreOrderMessage.defaultProps = {
  expectFrom: {},
  expectTo: {},
  address: null,
};

PreOrderMessage.displayName = 'PreOrderMessage';

const StoreInfo = ({ storeAddress, storeName, total, deliveryAddress, pickupTime, shippingType }) => {
  const { t } = useTranslation('OrderingThankYou');
  const contentMapping = {
    [DELIVERY_METHOD.PICKUP]: {
      timeLabel: t('PickUpOn'),
      time: pickupTime,
      addressLabel: t('PickupAt'),
      address: storeAddress,
    },
    [DELIVERY_METHOD.TAKE_AWAY]: {
      address: storeAddress,
    },
    [DELIVERY_METHOD.DELIVERY]: {
      addressLabel: t('DeliveringTo'),
      address: deliveryAddress,
    },
  };

  if (!storeAddress) {
    return null;
  }

  return (
    <div className="ordering-thanks__summary-content padding-small">
      <div className="padding-left-right-small flex flex-middle flex-space-between">
        <h3 className="margin-top-bottom-small text-size-big text-weight-bolder">{storeName}</h3>
      </div>

      {contentMapping[shippingType].time ? (
        <div className="padding-left-right-small">
          <h4 className="margin-top-bottom-small">{contentMapping[shippingType].timeLabel}</h4>
          <p className="flex flex-top padding-top-bottom-small">
            <IconAccessTime className="icon icon__small icon__primary" />
            <span className="ordering-thanks__time padding-top-bottom-smaller padding-left-right-small text-weight-bolder text-line-height-base">
              {contentMapping[shippingType].time}
            </span>
          </p>
        </div>
      ) : null}

      {contentMapping[shippingType].address ? (
        <div>
          <h4 className="padding-left-right-small margin-top-bottom-small">
            {contentMapping[shippingType].addressLabel}
          </h4>
          <p className="padding-left-right-small flex flex-top padding-top-bottom-small">
            <IconPin className="icon icon__small icon__primary" />
            <span className="ordering-thanks__address padding-top-bottom-smaller padding-left-right-small text-line-height-base">
              {contentMapping[shippingType].address}
            </span>
          </p>
        </div>
      ) : null}

      <div className="padding-normal text-center">
        <span className="margin-left-right-smaller ordering-thanks__total">{t('Total')}</span>
        <CurrencyNumber
          className="ordering-thanks__total margin-left-right-smaller text-weight-bolder"
          money={total || 0}
        />
      </div>
    </div>
  );
};

StoreInfo.propTypes = {
  storeAddress: PropTypes.string,
  storeName: PropTypes.string,
  total: PropTypes.number,
  deliveryAddress: PropTypes.string,
  shippingType: PropTypes.string,
  pickupTime: PropTypes.string,
};

StoreInfo.defaultProps = {
  storeAddress: null,
  storeName: null,
  total: 0,
  deliveryAddress: null,
  shippingType: null,
  pickupTime: null,
};

StoreInfo.displayName = 'StoreInfo';

const ViewOrderDetailsButton = ({ history }) => {
  const { t } = useTranslation('OrderingThankYou');

  return (
    <button
      className="ordering-thanks__button-card-link button button__block text-weight-bolder text-uppercase"
      onClick={() => {
        history.push({
          pathname: Constants.ROUTER_PATHS.ORDER_DETAILS,
          search: window.location.search,
        });
      }}
      data-testid="thanks__view-receipt"
      data-test-id="ordering.thank-you.view-detail-btn"
    >
      {t('ViewOrderDetails')}
    </button>
  );
};

ViewOrderDetailsButton.displayName = 'ViewOrderDetailsButton';

function OrderSummary({
  history,
  orderStatus,
  isPreOrder,
  orderCancellationButtonVisible,
  shippingType,
  isOrderCancellable,
  orderDeliveryInfo,
  order,
  storeInfo,
  storeName,
  onlineStoreInfo,
  businessUTCOffset,
  updateCancellationReasonVisibleState,
  onClickCancelOrderButton,
}) {
  const { t } = useTranslation('OrderingThankYou');

  if (orderStatus === ORDER_STATUS.PENDING_PAYMENT) {
    return null;
  }

  const { expectDeliveryDateRange, address } = orderDeliveryInfo || {};
  const { total, createdTime } = order || {};
  const handleOrderCancellationButtonClick = () => {
    if (!isOrderCancellable) {
      alert(t('OrderCannotBeCancelledAsARiderFound'), {
        title: t('YourFoodIsOnTheWay'),
        closeButtonContent: t('GotIt'),
      });

      return;
    }

    onClickCancelOrderButton();
    updateCancellationReasonVisibleState(true);
  };

  if (shippingType === DELIVERY_METHOD.DINE_IN) {
    return null;
  }

  const isDeliveryPreOrder = shippingType === DELIVERY_METHOD.DELIVERY && isPreOrder;
  const paidOrAcceptedOrder = ['paid', 'accepted'].includes(orderStatus);

  return (
    <div className="margin-small">
      <div className="ordering-thanks__card card">
        {isDeliveryPreOrder && paidOrAcceptedOrder ? (
          <PreOrderMessage
            expectFrom={getBusinessDateTime(businessUTCOffset, new Date(expectDeliveryDateRange[0]))}
            expectTo={getBusinessDateTime(businessUTCOffset, new Date(expectDeliveryDateRange[1]))}
            address={address && address.deliveryTo}
          />
        ) : (
          <StoreInfo
            storeAddress={Utils.getValidAddress(storeInfo || {}, Constants.ADDRESS_RANGE.COUNTRY)}
            storeName={storeName}
            total={total}
            deliveryAddress={address && address.deliveryTo}
            shippingType={shippingType}
            pickupTime={formatPickupTime({
              date: isPreOrder
                ? new Date(expectDeliveryDateRange[0])
                : new Date(new Date(createdTime).getTime() + 1000 * 60 * 30),
              locale: onlineStoreInfo.country,
              businessUTCOffset,
            })}
          />
        )}

        <ViewOrderDetailsButton history={history} />

        {orderCancellationButtonVisible && (
          <button
            className={`ordering-thanks__order-cancellation-button ${
              isOrderCancellable ? '' : 'button__link-disabled'
            } button button__block text-weight-bolder text-uppercase`}
            onClick={handleOrderCancellationButtonClick}
            data-testid="thanks__order-cancellation-button"
            data-test-id="ordering.thank-you.order-cancellation-button"
          >
            {t('CancelOrder')}
          </button>
        )}
      </div>
    </div>
  );
}

OrderSummary.displayName = 'OrderSummary';

OrderSummary.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object,
  orderStatus: PropTypes.oneOf(Object.values(ORDER_STATUS)),
  isPreOrder: PropTypes.bool,
  orderCancellationButtonVisible: PropTypes.bool,
  shippingType: PropTypes.oneOf(Object.values(DELIVERY_METHOD)),
  isOrderCancellable: PropTypes.bool,
  storeName: PropTypes.string,
  onClickCancelOrderButton: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  order: PropTypes.object,
  updateCancellationReasonVisibleState: PropTypes.func,
  businessUTCOffset: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  orderDeliveryInfo: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  onlineStoreInfo: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  storeInfo: PropTypes.object,
};

OrderSummary.defaultProps = {
  history: {},
  orderStatus: null,
  isPreOrder: false,
  orderCancellationButtonVisible: false,
  shippingType: null,
  isOrderCancellable: false,
  storeName: null,
  order: {},
  orderDeliveryInfo: {},
  storeInfo: {},
  onClickCancelOrderButton: () => {},
  updateCancellationReasonVisibleState: () => {},
  businessUTCOffset: 480,
  onlineStoreInfo: {},
};

export default connect(
  state => ({
    orderStatus: getOrderStatus(state),
    isPreOrder: getIsPreOrder(state),
    shippingType: getOrderShippingType(state),
    isOrderCancellable: getIsOrderCancellable(state),
    orderCancellationButtonVisible: getOrderCancellationButtonVisible(state),
    storeName: getOrderStoreName(state),
    order: getOrder(state),
    orderDeliveryInfo: getOrderDeliveryInfo(state),
    storeInfo: getOrderStoreInfo(state),
  }),
  {
    updateCancellationReasonVisibleState: thankYouActionCreators.updateCancellationReasonVisibleState,
  }
)(OrderSummary);
