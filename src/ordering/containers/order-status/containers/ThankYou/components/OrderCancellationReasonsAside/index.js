import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Radio from '../../../../../../../components/Radio';
import { ORDER_CANCELLATION_REASONS } from '../../constants';
import _isFunction from 'lodash/isFunction';
import '../OrderCancellationReasonsAside.scss';

const orderCancellationReasons = [
  {
    value: ORDER_CANCELLATION_REASONS.TOO_LONG_DELIVERY_TIME,
    displayNameTransKey: 'DeliveryTimeIsTooLong',
  },
  {
    value: ORDER_CANCELLATION_REASONS.MERCHANT_CALLED_TO_CANCEL,
    displayNameTransKey: 'MerchantCalledToCancel',
  },
  {
    value: ORDER_CANCELLATION_REASONS.WRONG_DELIVERY_INFORMATION,
    displayNameTransKey: 'WrongDeliveryInformation',
  },
  {
    value: ORDER_CANCELLATION_REASONS.ORDERED_WRONG_ITEM,
    displayNameTransKey: 'OrderedWrongItem',
  },
  {
    value: ORDER_CANCELLATION_REASONS.OTHERS,
    displayNameTransKey: 'Others',
  },
];

const SPECIFY_REASON_MAX_LENGTH = 140;

function OrderCancellationReasonsAside({ show, onHide }) {
  const { t } = useTranslation('OrderingThankYou');
  const [selectedReason, setSelectedReason] = useState(null);
  const [specifyReason, setSpecifyReason] = useState('');

  const handleReasonChange = useCallback(
    reason => {
      setSelectedReason(reason.value);
    },
    [setSelectedReason]
  );

  const handleSpecifyReasonInput = useCallback(
    event => {
      setSpecifyReason(event.target.value);
    },
    [setSpecifyReason]
  );

  const handleOnHide = useCallback(
    event => {
      if (event && event.target !== event.currentTarget) {
        return;
      }

      _isFunction(onHide) && onHide();
    },
    [onHide]
  );

  const requireSpecifyReason = selectedReason === ORDER_CANCELLATION_REASONS.OTHERS;

  const cancelButtonDisabled = !selectedReason || (requireSpecifyReason && !specifyReason);

  return (
    <aside className={`order-cancellation-reasons aside fixed-wrapper ${show ? 'active' : ''}`} onClick={handleOnHide}>
      <div className="order-cancellation-reasons__container aside__content absolute-wrapper">
        <div className="order-cancellation-reasons__title text-size-big padding-normal">
          {t('PleaseSelectCancellationReason')}
        </div>
        <div className="order-cancellation-reasons__content-wrapper padding-normal">
          <ul className="order-cancellation-reasons__content margin-left-right-small">
            {orderCancellationReasons.map(reason => (
              <li
                onClick={() => handleReasonChange(reason)}
                className="flex flex-space-between flex-middle padding-small"
                key={reason.value}
              >
                <div>{t(reason.displayNameTransKey)}</div>
                <Radio name="orderCancellationReason" checked={selectedReason === reason.value} />
              </li>
            ))}
          </ul>

          {requireSpecifyReason && (
            <div className="order-cancellation-reasons__specify-reason margin-normal form__group border-radius-large">
              <textarea
                value={specifyReason}
                onChange={handleSpecifyReasonInput}
                className="form__textarea padding-small"
                placeholder={t('PleaseSpecifyReason')}
                row={5}
                maxLength={SPECIFY_REASON_MAX_LENGTH}
              ></textarea>

              <p className="text-size-small text-right padding-small text-opacity">
                {t('LimitCharacters', { inputLength: specifyReason.length, maxLength: SPECIFY_REASON_MAX_LENGTH })}
              </p>
            </div>
          )}
        </div>

        <div className="order-cancellation-reasons__button-wrapper padding-normal margin-left-right-small">
          <button
            disabled={cancelButtonDisabled}
            className="button button__fill button__block text-weight-bolder text-uppercase"
          >
            {t('CancelOrder')}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default OrderCancellationReasonsAside;
