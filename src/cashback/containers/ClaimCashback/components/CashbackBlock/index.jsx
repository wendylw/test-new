import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getOrderCashbackValue } from '../../../../redux/modules/claim';

const CashbackBlock = () => {
  const { t } = useTranslation();
  const orderCashbackValue = useSelector(getOrderCashbackValue);

  return (
    <section>
      <h4>{t('EarnCashbackNow')}</h4>
      <data value={orderCashbackValue}>{orderCashbackValue}</data>
    </section>
  );
};

CashbackBlock.displayName = 'CashbackBlock';

export default CashbackBlock;
