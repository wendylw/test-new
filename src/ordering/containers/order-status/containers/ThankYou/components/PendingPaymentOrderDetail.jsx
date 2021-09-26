import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Constants from '../../../../../../utils/constants';
import {
  getOrder,
  getOrderStatus,
  getPromotion,
  getOrderItems,
  getServiceCharge,
  getDisplayDiscount,
} from '../../../redux/selector';
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

const OrderDetails = ({ items }) => {
  const { t } = useTranslation('OrderingThankYou');

  return (
    <>
      <span className="ordering-details__items">{t('Items')}</span>
      <ul>
        {(items || []).map(value => {
          const { id, title, displayPrice, quantity, variationTexts, itemType } = value;

          // remove items whose itemType is not null
          if (itemType) {
            return null;
          }

          return (
            <li key={`title-${id}`} className="flex flex-middle flex-space-between">
              <div className="flex flex-top">
                <span className="padding-top-bottom-small flex__shrink-fixed text-opacity">{quantity} x</span>
                <div className="padding-small">
                  <span className="ordering-details__item-title text-opacity">{title}</span>
                  <p>
                    {variationTexts && variationTexts[0] ? (
                      <span className="ordering-details__item-variations">{variationTexts.join(', ')}</span>
                    ) : null}
                  </p>
                </div>
              </div>
              <CurrencyNumber
                className="padding-top-bottom-small flex__shrink-fixed text-opacity"
                money={displayPrice * quantity}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
};

OrderDetails.displayName = 'OrderDetails';

OrderDetails.propTypes = {
  items: itemPropTypes,
};

OrderDetails.defaultProps = {
  items: [],
};

function PendingPaymentOrderDetail({ order, promotion, items, serviceCharge, displayDiscount, orderStatus }) {
  const { t } = useTranslation(['OrderingThankYou', 'OrderingDelivery']);
  const { id, shippingFee, subtotal, total, tax } = order || {};
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
        <OrderDetails items={items} />
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
        <li className="flex flex-space-between flex-middle">
          <span className="padding-top-bottom-small text-opacity">{t('OrderingDelivery:DeliveryCharge')}</span>
          <CurrencyNumber className="padding-top-bottom-small text-opacity" money={shippingFee || 0} />
        </li>
        <li className="flex flex-space-between flex-middle">
          <span className="padding-top-bottom-small text-opacity">{t('ServiceCharge')}</span>
          <CurrencyNumber className="padding-top-bottom-small text-opacity" money={serviceCharge || 0} />
        </li>
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
};

PendingPaymentOrderDetail.defaultProps = {
  order: {},
  promotion: {},
  items: [],
  serviceCharge: 0,
  displayDiscount: 0,
  orderStatus: null,
};

export default connect(state => ({
  order: getOrder(state),
  promotion: getPromotion(state),
  items: getOrderItems(state),
  serviceCharge: getServiceCharge(state),
  displayDiscount: getDisplayDiscount(state),
  orderStatus: getOrderStatus(state),
}))(PendingPaymentOrderDetail);
