import React from 'react';
import { useTranslation } from 'react-i18next';
import Radio from '../../../../../../../components/Radio';
import { ORDER_CANCELLATION_REASONS } from '../../constants';
import '../OrderCancellationReasonsAside.scss';

const orderCancellationReasons = [
  {
    value: ORDER_CANCELLATION_REASONS.TOO_LONG_DELIVERY_TIME,
    displayName_transKey: 'DeliveryTimeIsTooLong',
  },
  {
    value: ORDER_CANCELLATION_REASONS.MERCHANT_CALLED_TO_CANCEL,
    displayName_transKey: 'MerchantCalledToCancel',
  },
  {
    value: ORDER_CANCELLATION_REASONS.WRONG_DELIVERY_INFORMATION,
    displayName_transKey: 'WrongDeliveryInformation',
  },
  {
    value: ORDER_CANCELLATION_REASONS.ORDERED_WRONG_ITEM,
    displayName_transKey: 'OrderedWrongItem',
  },
  {
    value: ORDER_CANCELLATION_REASONS.OTHERS,
    displayName_transKey: 'Others',
  },
];

function OrderCancellationReasonsAside() {
  const { t } = useTranslation('OrderingThankYou');

  return (
    <aside className="order-cancellation-reasons-aside aside fixed-wrapper active">
      <div className="order-cancellation-reasons-aside__container aside__content absolute-wrapper">
        <div className="order-cancellation-reasons-aside__title text-size-big padding-normal">
          {t('PleaseSelectCancellationReason')}
        </div>
        <div class="order-cancellation-reasons-aside__content-wrapper padding-normal">
          <ul className="order-cancellation-reasons-aside__content margin-left-right-small">
            {orderCancellationReasons.map(reason => (
              <li className="flex flex-space-between flex-middle padding-small" key={reason.value}>
                <div>{t(reason.displayName_transKey)}</div>
                <Radio checked />
              </li>
            ))}
          </ul>
        </div>

        <div className="order-cancellation-reasons-aside__button-wrapper padding-normal margin-left-right-small">
          <button className="button button__fill button__block text-weight-bolder text-uppercase">
            {t('CancelOrder')}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default OrderCancellationReasonsAside;
