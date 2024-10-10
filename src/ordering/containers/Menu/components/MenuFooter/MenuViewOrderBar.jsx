import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { viewOnGoingOrder } from '../../redux/cart/thunks';
import { getOrderingOngoingBannerVisibility } from '../../redux/cart/selectors';
import { ActivePointIcon } from '../../../../../common/components/Icons';
import Button from '../../../../../common/components/Button';
import styles from './MenuViewOrderBar.module.scss';

const MenuViewOrderBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // has on going order (only available on pay later)
  const orderingOngoingBannerVisibility = useSelector(getOrderingOngoingBannerVisibility);

  console.log(orderingOngoingBannerVisibility);

  if (!orderingOngoingBannerVisibility) {
    return null;
  }

  return (
    <div className={styles.MenuViewOrderBar}>
      <div className="tw-flex tw-items-center tw-p-12 sm:tw-p-12px">
        <ActivePointIcon />
        <span className="tw-mx-8 sm:tw-mx-8px tw-text-sm tw-text-gray-800">{t('OrderOngoing')}</span>
      </div>
      <Button
        type="text"
        theme="ghost"
        className={styles.MenuViewOrderBarButton}
        data-test-id="ordering.menu.bar.view-order-btn"
        onClick={() => dispatch(viewOnGoingOrder())}
      >
        {t('ViewOrder')}
      </Button>
    </div>
  );
};

MenuViewOrderBar.displayName = 'MenuViewOrderBar';

export default MenuViewOrderBar;
