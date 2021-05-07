import React from 'react';
import { ORDER_DELAY_REASON_CODES } from '../../constants';
import _get from 'lodash/get';
import { useTranslation } from 'react-i18next';
import RamadanIcon from '../../../../../../../images/order-delay-ramadan.svg';
import '../OrderDelayMessage.scss';

const orderDelayMessageConfigMap = {
  [ORDER_DELAY_REASON_CODES.RAMADAN]: {
    icon: RamadanIcon,
    contentTransKey: 'OrderDelayReasonRamadan',
  },
};

function OrderDelayMessage({ orderDelayReason }) {
  const { t } = useTranslation('OrderingThankYou');

  const orderDelayMessageConfig = _get(orderDelayMessageConfigMap, orderDelayReason, null);

  if (!orderDelayMessageConfig) {
    return null;
  }

  return (
    <div className="order-delay-message text-center margin-normal">
      <img className="order-delay-message__icon" alt="Order Delay Icon" src={orderDelayMessageConfig.icon} />
      <div className="order-delay-message__content card padding-normal text-line-height-base">
        {t(orderDelayMessageConfig.contentTransKey)}
      </div>
    </div>
  );
}

export default OrderDelayMessage;
