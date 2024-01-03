import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Constants from '../../../../../../utils/constants';
import { getIsTakeawayType } from '../../../../../redux/modules/app';
import {
  getOrder,
  getOrderStatus,
  getPromotion,
  getOrderItems,
  getServiceCharge,
  getDisplayDiscount,
} from '../../../redux/selector';
import ItemDetails from '../../../components/ItemDetails';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const { ORDER_STATUS } = Constants;
const itemPropTypes = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    displayPrice: PropTypes.number,
    quantity: PropTypes.number,
    variationTexts: PropTypes.arrayOf(PropTypes.string),
    itemType: PropTypes.string,
  })
);

const OrderDetails = ({ items, shippingType }) => {
  const { t } = useTranslation('OrderingThankYou');

  return (
    <>
      <span className="ordering-details__items">{t('Items')}</span>
      <ul>
        {(items || []).map(item => {
          const { itemType, id } = item;

          // remove items whose itemType is not null
          if (itemType) {
            return null;
          }

          return (
            <ItemDetails
              key={id}
              item={item}
              shippingType={shippingType}
              data-test-id="ordering.order-status.thank-you.cart-item"
            />
          );
        })}
      </ul>
    </>
  );
};

OrderDetails.displayName = 'OrderDetails';

OrderDetails.propTypes = {
  items: itemPropTypes,
  shippingType: PropTypes.string,
};

OrderDetails.defaultProps = {
  items: [],
  shippingType: '',
};

function PendingPaymentOrderDetail({
  order,
  promotion,
  items,
  serviceCharge,
  displayDiscount,
  orderStatus,
  isTakeawayType,
}) {
  const { t } = useTranslation(['OrderingThankYou', 'OrderingDelivery']);
  const { id, shippingFee, shippingType, subtotal, total, tax, takeawayCharges, productsManualDiscount } = order || {};
  const invalidStatus = [
    ORDER_STATUS.CREATED,
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.PENDING_VERIFICATION,
    ORDER_STATUS.PAYMENT_CANCELLED,
  ];

  if (!invalidStatus.includes(orderStatus)) {
    return null;
  }

  return (
    <div className="card padding-top-bottom-small padding-left-right-normal margin-small">
      <div className="border__bottom-divider padding-top-bottom-normal">
        <OrderDetails items={items} shippingType={shippingType} />
      </div>

      <ul className="ordering-details__billing-container padding-top-bottom-normal">
        <li className="flex flex-space-between flex-middle">
          <span className="padding-top-bottom-small text-opacity">{t('Subtotal')}</span>
          <CurrencyNumber className="padding-top-bottom-small text-opacity" money={subtotal || 0} />
        </li>
        <li className="flex flex-space-between flex-middle">
          <span className="padding-top-bottom-small text-opacity">{t('Tax')}</span>
          <CurrencyNumber className="padding-top-bottom-small text-opacity" money={tax || 0} />
        </li>
        {isTakeawayType && takeawayCharges > 0 && (
          <li className="flex flex-space-between flex-middle">
            <span className="padding-top-bottom-small text-opacity">{t('OrderingDelivery:TakeawayCharge')}</span>
            <CurrencyNumber className="padding-top-bottom-small text-opacity" money={takeawayCharges || 0} />
          </li>
        )}
        <li className="flex flex-space-between flex-middle">
          <span className="padding-top-bottom-small text-opacity">{t('OrderingDelivery:DeliveryCharge')}</span>
          <CurrencyNumber className="padding-top-bottom-small text-opacity" money={shippingFee || 0} />
        </li>
        <li className="flex flex-space-between flex-middle">
          <span className="padding-top-bottom-small text-opacity">{t('ServiceCharge')}</span>
          <CurrencyNumber className="padding-top-bottom-small text-opacity" money={serviceCharge || 0} />
        </li>
        {productsManualDiscount > 0 ? (
          <li className="flex flex-space-between flex-middle">
            <span className="padding-top-bottom-small text-opacity">{t('Discount')}</span>
            <CurrencyNumber className="padding-top-bottom-small text-opacity" money={-productsManualDiscount} />
          </li>
        ) : null}
        <li className="flex flex-space-between flex-middle">
          <span className="padding-top-bottom-small text-opacity">{t('Cashback')}</span>
          <CurrencyNumber className="padding-top-bottom-small text-opacity" money={-displayDiscount || 0} />
        </li>

        {/* Promotion */}
        {promotion ? (
          <li className="flex flex-space-between flex-middle">
            <span className="padding-top-bottom-small text-opacity">
              {t(promotion.promoType)} ({promotion.promoCode})
            </span>
            <CurrencyNumber className="text-opacity" money={-promotion.discount} />
          </li>
        ) : null}
        {/* end of Promotion */}

        <li className="flex flex-space-between flex-middle">
          <label htmlFor={`total-${id}`} className="padding-top-bottom-normal text-size-big text-weight-bolder">
            {t('Total')}
          </label>
          <CurrencyNumber
            id={`total-${id}`}
            className="padding-top-bottom-normal text-size-big text-weight-bolder"
            money={total || 0}
          />
        </li>
      </ul>
    </div>
  );
}

PendingPaymentOrderDetail.displayName = 'PendingPaymentOrderDetail';

PendingPaymentOrderDetail.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.string,
    shippingFee: PropTypes.number,
    subtotal: PropTypes.number,
    total: PropTypes.number,
    tax: PropTypes.number,
  }),
  promotion: PropTypes.shape({
    promoType: PropTypes.string,
    promoCode: PropTypes.string,
    discount: PropTypes.number,
  }),
  items: itemPropTypes,
  serviceCharge: PropTypes.number,
  displayDiscount: PropTypes.number,
  orderStatus: PropTypes.oneOf(Object.values(ORDER_STATUS)),
  isTakeawayType: PropTypes.bool,
};

PendingPaymentOrderDetail.defaultProps = {
  order: {},
  promotion: {},
  items: [],
  serviceCharge: 0,
  displayDiscount: 0,
  orderStatus: null,
  isTakeawayType: false,
};

export default connect(state => ({
  order: getOrder(state),
  promotion: getPromotion(state),
  items: getOrderItems(state),
  serviceCharge: getServiceCharge(state),
  displayDiscount: getDisplayDiscount(state),
  orderStatus: getOrderStatus(state),
  isTakeawayType: getIsTakeawayType(state),
}))(PendingPaymentOrderDetail);
