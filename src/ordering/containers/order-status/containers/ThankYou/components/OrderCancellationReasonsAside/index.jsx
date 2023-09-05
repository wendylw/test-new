import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import _isFunction from 'lodash/isFunction';
import { useSelector } from 'react-redux';
import Radio from '../../../../../../../components/Radio';
import { ORDER_CANCELLATION_REASONS } from '../../constants';
import '../OrderCancellationReasonsAside.scss';
import { getCancelOrderStatus } from '../../redux/selector';

const orderCancellationReasons = [
  {
    value: ORDER_CANCELLATION_REASONS.TAKING_TOO_LONG_TO_FIND_RIDER,
    displayNameTransKey: 'TakingTooLongToFindRider',
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
    value: ORDER_CANCELLATION_REASONS.CHANGE_OF_MIND,
    displayNameTransKey: 'ChangeOfMind',
  },
  {
    value: ORDER_CANCELLATION_REASONS.OTHERS,
    displayNameTransKey: 'Others',
  },
];

const SPECIFY_REASON_MAX_LENGTH = 140;

function OrderCancellationReasonsAside({ show, onHide, onCancelOrder }) {
  const { t } = useTranslation('OrderingThankYou');
  const [selectedReason, setSelectedReason] = useState(null);
  const [specifyReason, setSpecifyReason] = useState('');
  const cancelOrderStatus = useSelector(getCancelOrderStatus);

  const orderCancellationProcessing = cancelOrderStatus === 'pending';

  const requireSpecifyReason = selectedReason === ORDER_CANCELLATION_REASONS.OTHERS;

  const cancelButtonDisabled =
    !selectedReason || (requireSpecifyReason && !specifyReason) || orderCancellationProcessing;

  const handleReasonChange = useCallback(
    reason => {
      if (orderCancellationProcessing) {
        return;
      }

      setSelectedReason(reason.value);
    },
    [orderCancellationProcessing]
  );

  const handleSpecifyReasonInput = useCallback(
    event => {
      setSpecifyReason(event.target.value);
    },
    [setSpecifyReason]
  );

  const handleOnHide = useCallback(
    event => {
      if (orderCancellationProcessing) {
        return;
      }

      if (event && event.target !== event.currentTarget) {
        return;
      }

      _isFunction(onHide) && onHide();
    },
    [onHide, orderCancellationProcessing]
  );

  const handleOrderCancellation = useCallback(() => {
    if (orderCancellationProcessing) {
      return;
    }

    _isFunction(onCancelOrder) &&
      onCancelOrder({
        reason: selectedReason,
        detail: requireSpecifyReason ? specifyReason : null,
      });
  }, [onCancelOrder, orderCancellationProcessing, requireSpecifyReason, selectedReason, specifyReason]);

  return (
    <aside
      className={`order-cancellation-reasons aside fixed-wrapper ${show ? 'active' : ''}`}
      data-test-id="ordering.order-status.thank-you.aside.hide-btn"
      onClick={handleOnHide}
    >
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
                data-test-id="ordering.order-status.thank-you.aside.reason-item"
                key={reason.value}
              >
                <div>{t(reason.displayNameTransKey)}</div>
                <Radio
                  disabled={orderCancellationProcessing}
                  name="orderCancellationReason"
                  checked={selectedReason === reason.value}
                />
              </li>
            ))}
          </ul>

          {requireSpecifyReason && (
            <div className="order-cancellation-reasons__specify-reason margin-normal form__group border-radius-large">
              <textarea
                value={specifyReason}
                onChange={handleSpecifyReasonInput}
                className="form__textarea padding-small"
                data-test-id="ordering.order-status.thank-you.aside.input"
                placeholder={t('PleaseSpecifyReason')}
                row={5}
                maxLength={SPECIFY_REASON_MAX_LENGTH}
                readOnly={orderCancellationProcessing}
              />

              <p className="text-size-small text-right padding-small text-opacity">
                {t('LimitCharacters', { inputLength: specifyReason.length, maxLength: SPECIFY_REASON_MAX_LENGTH })}
              </p>
            </div>
          )}
        </div>

        <div className="order-cancellation-reasons__button-wrapper padding-normal margin-left-right-small">
          <button
            onClick={handleOrderCancellation}
            disabled={cancelButtonDisabled}
            className="button button__fill button__block text-weight-bolder text-uppercase"
            data-test-id="ordering.order-status.thank-you.aside.cancel-btn"
          >
            {orderCancellationProcessing ? t('Processing') : t('CancelOrder')}
          </button>
        </div>
      </div>
    </aside>
  );
}

OrderCancellationReasonsAside.displayName = 'OrderCancellationReasonsAside';

OrderCancellationReasonsAside.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  onCancelOrder: PropTypes.func,
};

OrderCancellationReasonsAside.defaultProps = {
  show: false,
  onHide: () => {},
  onCancelOrder: () => {},
};

export default OrderCancellationReasonsAside;
