import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import {
  getMinimumConsumptionFormattedPrice,
  getFormattedDiffPriceOnFulfillMinimumConsumption,
  getHiddenMiniOrderStatus,
  getCartItemsSubtotal,
} from '../../redux/cart/selectors';
import styles from './MiniMumOrder.module.scss';

const MiniMumOrder = () => {
  const { t } = useTranslation();
  const cartItemsSubtotal = useSelector(getCartItemsSubtotal);
  const minimumConsumptionFormattedPrice = useSelector(getMinimumConsumptionFormattedPrice);
  const formattedDiffPriceOnFulfillMinimumConsumption = useSelector(getFormattedDiffPriceOnFulfillMinimumConsumption);
  const hiddenMiniOrderStatus = useSelector(getHiddenMiniOrderStatus);

  if (hiddenMiniOrderStatus) {
    return null;
  }

  const renderMiniMunOrderContentOrMiniOrderContentDiff = () => {
    if (cartItemsSubtotal) {
      return (
        <p className={styles.MiniMumOrderContentDiff}>
          <Trans
            t={t}
            i18nKey="MinOrderDiffRM"
            values={{ minimumConsumptionFormattedPrice, formattedDiffPriceOnFulfillMinimumConsumption }}
            components={[
              <span className={styles.MiniMumOrderContentDiff} />,
              <span className={styles.MiniMumOrderContent} />,
            ]}
          />
        </p>
      );
    }
    return (
      <span className={styles.MiniMumOrderContentDiff}>{t('MinOrderRM', { minimumConsumptionFormattedPrice })}</span>
    );
  };

  return <div className={styles.MiniMumOrder}>{renderMiniMunOrderContentOrMiniOrderContentDiff()}</div>;
};

MiniMumOrder.displayName = 'MiniMumOrder';

export default MiniMumOrder;
