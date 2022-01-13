import React from 'react';
import { useTranslation } from 'react-i18next';
import EmptyImage from '../../../images/empty.png';

function OrderListEmptyView() {
  const { t } = useTranslation('OrderHistory');

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        paddingBottom: '80px',
      }}
      className="flex flex-column flex-center flex-middle"
    >
      <img alt="Empty" src={EmptyImage} />
      <p className="order-history__empty-content text-center text-line-height-higher text-size-bigger padding-small">
        {t('OrderHistoryEmptyContent')}
      </p>
    </div>
  );
}

OrderListEmptyView.displayName = 'OrderListEmptyView';

export default OrderListEmptyView;
