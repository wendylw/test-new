import React from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import { useTranslation } from 'react-i18next';
import RamadanIcon from '../../../../../../images/order-delay-ramadan.svg';
import './OrderDelayMessage.scss';

const ORDER_DELAY_REASON_CODES = {
  RAMADAN: 'ramadan',
};
const orderDelayMessageConfigMap = {
  [ORDER_DELAY_REASON_CODES.RAMADAN]: {
    icon: RamadanIcon,
    contentTransKey: 'OrderDelayReasonRamadan',
  },
};

function OrderDelayMessage({ orderDelayReason }) {
  const { t } = useTranslation('OrderingThankYou');

  const orderDelayMessageConfig = _get(orderDelayMessageConfigMap, orderDelayReason, null);

  if (!orderDelayMessageConfig || !orderDelayReason) {
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
OrderDelayMessage.displayName = 'OrderDelayMessage';

OrderDelayMessage.propTypes = {
  orderDelayReason: PropTypes.string,
};

OrderDelayMessage.defaultProps = {
  orderDelayReason: null,
};

export default OrderDelayMessage;
