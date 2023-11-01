import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { VariationShape } from './prop-types';
import Tag from '../../../../../common/components/Tag';
import QuantityAdjuster from '../../../../../common/components/QuantityAdjuster';
import SelectionAmountLimit from './SelectionAmountLimit';
import { increaseVariationOptionQuantity, decreaseVariationOptionQuantity } from '../../redux/productDetail/thunks';
import styles from './ProductDetailDrawer.module.scss';

const QuantityMultipleChoiceVariation = ({ variation }) => {
  const { name, formattedPriceDiff, selectedQuantity, options, selectionAmountLimit } = variation;
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <section className={styles.variationContainer}>
      <div className={styles.variationBasicInfo}>
        <h3 className={styles.variationTitle}>
          {name}
          {selectedQuantity ? (
            <Tag className="tw-flex-shrink-0 tw-mx-12 sm:tw-mx-12px tw-my-3 sm:tw-my-3px">
              {t('NumSelected', { amount: selectedQuantity })}{' '}
            </Tag>
          ) : null}
        </h3>
        <div>{formattedPriceDiff}</div>
      </div>
      <SelectionAmountLimit rule={selectionAmountLimit} />
      <div>
        {options.map(option => (
          <div key={option.id} className={`${styles.variationOptionItem} ${option.disabled ? styles.unavailable : ''}`}>
            <div className={styles.variationOptionItemLabel}>
              <div className={styles.variationOptionItemName}>{option.name}</div>
              <div className={styles.variationOptionItemNote}>
                {!option.available ? t('Unavailable') : option.formattedPriceDiff || null}
              </div>
            </div>
            <QuantityAdjuster
              className={styles.variationOptionOperator}
              data-test-id="ordering.menu.product-detail-drawer.quantity-adjuster"
              increaseDisabled={option.disabled || !option.isAbleToIncreaseQuantity}
              decreaseDisabled={option.disabled || !option.isAbleToDecreaseQuantity}
              value={option.quantity}
              onChange={delta => {
                const op = delta > 0 ? increaseVariationOptionQuantity : decreaseVariationOptionQuantity;
                dispatch(op({ variationId: variation.id, optionId: option.id }));
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
QuantityMultipleChoiceVariation.displayName = 'QuantityMultipleChoiceVariation';
QuantityMultipleChoiceVariation.propTypes = { variation: VariationShape.isRequired };

export default QuantityMultipleChoiceVariation;
