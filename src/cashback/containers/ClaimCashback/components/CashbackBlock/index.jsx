import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getOrderCashbackValue } from '../../../../redux/modules/claim';
import styles from './CashbackBlock.module.scss';

const CashbackBlock = () => {
  const { t } = useTranslation(['Cashback']);
  const orderCashbackValue = useSelector(getOrderCashbackValue);

  return (
    <section className={styles.CashbackBlock}>
      <h4 className={styles.CashbackBlockTitle}>{t('EarnCashbackNow')}</h4>
      <data className={styles.CashbackBlockCashback} value={orderCashbackValue}>
        {orderCashbackValue}
      </data>
    </section>
  );
};

CashbackBlock.displayName = 'CashbackBlock';

export default CashbackBlock;
