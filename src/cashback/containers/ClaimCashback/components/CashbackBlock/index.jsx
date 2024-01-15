import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getCustomerCashbackPrice } from '../../../../redux/modules/customer/selectors';

const CashbackBlock = () => {
  const { t } = useTranslation();
  const customerCashbackPrice = useSelector(getCustomerCashbackPrice);

  return (
    <section>
      <h4>{t('EarnCashbackNow')}</h4>
      <data value={customerCashbackPrice}>{customerCashbackPrice}</data>
    </section>
  );
};

CashbackBlock.displayName = 'CashbackBlock';

export default CashbackBlock;
