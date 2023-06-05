import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import styles from './ProductDetailDrawer.module.scss';
import CheckBox from '../../../../../common/components/CheckBox';
import {
  getTakeawayCharge,
  getIsTakeawayVariantSelected,
  getHasExtraTakeawayCharge,
} from '../../redux/productDetail/selectors';
import { takeawayVariantToggled } from '../../redux/productDetail/thunks';

const TakeawayVariation = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isTakeawayVariantSelected = useSelector(getIsTakeawayVariantSelected);
  const hasExtraTakeawayCharge = useSelector(getHasExtraTakeawayCharge);
  const takeawayCharge = useSelector(getTakeawayCharge);

  const handleToggleTakeawayVariant = useCallback(event => dispatch(takeawayVariantToggled(event.target.checked)), [
    dispatch,
  ]);

  return (
    <CheckBox
      containerClassName={styles.takeawayVariationItem}
      className={styles.variationOptionOperator}
      id="takeaway"
      name="takeawayVariation"
      value="takeawayVariation"
      checked={isTakeawayVariantSelected}
      onChange={handleToggleTakeawayVariant}
      data-heap-name="ordering.product-detail.takeaway-variation.checkbox-btn"
    >
      <div className={styles.variationOptionItemLabel}>
        <div className={styles.takeawayVariationItemName}>{t('TakeAway')}</div>
        {hasExtraTakeawayCharge && (
          <div className={styles.variationOptionItemNote}>
            {t('TakeawayPackagingFee', { packagingFee: takeawayCharge })}
          </div>
        )}
      </div>
    </CheckBox>
  );
};

TakeawayVariation.displayName = 'TakeawayVariation';

export default TakeawayVariation;
