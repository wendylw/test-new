import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Tag, X } from 'phosphor-react';
import Drawer from '../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../common/components/Drawer/DrawerHeader';
import PromotionContent from './PromotionContent';
import { getAvailablePromotions, getPromotionDrawerVisible } from '../../redux/promotion/selectors';
import { setPromotionDrawerVisible } from '../../redux/promotion/thunks';
import styles from './PromotionDrawer.module.scss';

const PromotionDrawer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const promotions = useSelector(getAvailablePromotions);
  const promotionDrawerVisible = useSelector(getPromotionDrawerVisible);
  const closeDrawer = useCallback(() => {
    dispatch(setPromotionDrawerVisible(false));
  }, [dispatch]);

  return (
    <Drawer
      className={styles.promotionDrawer}
      header={
        <DrawerHeader
          left={
            <X
              weight="light"
              className="tw-flex-shrink-0 tw-text-2xl tw-text-gray"
              data-test-id="ordering.menu.promotion-bar.close-btn"
              onClick={closeDrawer}
            />
          }
        >
          <span className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('Promos')}</span>
        </DrawerHeader>
      }
      show={promotionDrawerVisible}
      onClose={closeDrawer}
    >
      <ul>
        {promotions.map(promotion => (
          <li className={styles.promotionCardWrapper} key={promotion.id}>
            <div className={styles.promotionCard}>
              <div className={styles.promotionCardLabelWrapper}>
                <Tag weight="fill" className="tw-text-red" />
              </div>
              <div className={styles.promotionContentWrapper}>
                <PromotionContent
                  promotion={promotion}
                  textClassName={styles.promotionText}
                  promptClassName={styles.promotionPrompt}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Drawer>
  );
};

PromotionDrawer.displayName = 'PromotionDrawer';

export default PromotionDrawer;
