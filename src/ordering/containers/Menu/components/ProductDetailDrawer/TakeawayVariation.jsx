import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import styles from './ProductDetailDrawer.module.scss';
import CheckBox from '../../../../../common/components/CheckBox';
import {
  getFormattedTakeawayCharge,
  getIsTakeawayOptionChecked,
  getHasExtraTakeawayCharge,
} from '../../redux/productDetail/selectors';
import { takeawayOptionChecked, takeawayOptionUnchecked } from '../../redux/productDetail/thunks';

const TakeawayVariation = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isTakeawayOptionChecked = useSelector(getIsTakeawayOptionChecked);
  const hasExtraTakeawayCharge = useSelector(getHasExtraTakeawayCharge);
  const formattedTakeawayCharge = useSelector(getFormattedTakeawayCharge);

  const handleToggleTakeawayVariant = useCallback(
    event => {
      const isChecked = event.target.checked;

      isChecked ? dispatch(takeawayOptionChecked()) : dispatch(takeawayOptionUnchecked());
    },
    [dispatch]
  );

  return (
    <CheckBox
      containerClassName={styles.takeawayVariationItem}
      className={styles.variationOptionOperator}
      id="takeaway"
      name="takeawayVariation"
      value="takeawayVariation"
      checked={isTakeawayOptionChecked}
      onChange={handleToggleTakeawayVariant}
      data-test-id="ordering.product-detail.takeaway-variation.checkbox-btn"
    >
      <div className={styles.variationOptionItemLabel}>
        <div className={styles.takeawayVariationItemName}>{t('TakeAway')}</div>
        {hasExtraTakeawayCharge && (
          <div className={styles.variationOptionItemNote}>
            {t('TakeawayPackagingFee', { packagingFee: formattedTakeawayCharge })}
          </div>
        )}
      </div>
    </CheckBox>
  );
};

TakeawayVariation.displayName = 'TakeawayVariation';

export default TakeawayVariation;
