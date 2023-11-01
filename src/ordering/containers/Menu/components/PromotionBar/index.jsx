import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tag, CaretRight } from 'phosphor-react';
import PromotionContent from './PromotionContent';
import PromotionDrawer from './PromotionDrawer';
import { getAvailablePromotions } from '../../redux/promotion/selectors';
import { setPromotionDrawerVisible } from '../../redux/promotion/thunks';
import styles from './PromotionBar.module.scss';

const PROMO_DISPLAY_LIMIT = 2;

const PromotionBar = () => {
  const dispatch = useDispatch();
  const promotions = useSelector(getAvailablePromotions);

  if (!promotions.length) {
    return null;
  }
  const onlyOnePromo = promotions.length === 1;

  return (
    <>
      <div
        role="button"
        tabIndex="0"
        className={styles.promotionBar}
        data-test-id="ordering.menu.promotion-bar.show-btn"
        onClick={() => {
          dispatch(setPromotionDrawerVisible(true));
        }}
      >
        <ul className="tw-flex-1">
          {promotions.slice(0, PROMO_DISPLAY_LIMIT).map(promotion => (
            <li className={styles.promotionEntry} key={promotion.id}>
              <Tag className={styles.labelContainer} weight="fill" />
              <div className={`${styles.textContainer} ${onlyOnePromo ? 'tw-line-clamp-2' : 'tw-line-clamp-1'}`}>
                <PromotionContent promotion={promotion} textClassName="tw-leading-loose" singleLine />
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.arrowWrapper}>
          <CaretRight className="tw-text-gray-600" size={16} />
        </div>
      </div>
      <PromotionDrawer />
    </>
  );
};

PromotionBar.displayName = 'PromotionBar';

export default PromotionBar;
