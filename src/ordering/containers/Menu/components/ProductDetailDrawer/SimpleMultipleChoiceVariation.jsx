import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CheckBox from '../../../../../common/components/CheckBox';
import Tag from '../../../../../common/components/Tag';
import { VariationShape } from './prop-types';
import SelectionAmountLimit from './SelectionAmountLimit';
import { selectVariationOption, unselectVariationOption } from '../../redux/productDetail/thunks';
import styles from './ProductDetailDrawer.module.scss';

const SimpleMultipleChoiceVariation = ({ variation }) => {
  const { id: variationId, name, formattedPriceDiff, selectedQuantity, options, selectionAmountLimit } = variation;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onChange = useCallback(
    ({ target }) => {
      if (target.checked) {
        dispatch(selectVariationOption({ variationId, optionId: target.value }));
      } else {
        dispatch(unselectVariationOption({ variationId, optionId: target.value }));
      }
    },
    [dispatch, variationId]
  );
  return (
    <section className={styles.variationContainer}>
      <div className={styles.variationBasicInfo}>
        <h3 className={styles.variationTitle}>
          {name}
          {selectedQuantity ? (
            <Tag className="tw-flex-shrink-0 tw-mx-12 sm:tw-mx-12px tw-my-3 sm:tw-my-3px">
              {t('NumSelected', { amount: selectedQuantity })}
            </Tag>
          ) : null}
        </h3>
        <span>{formattedPriceDiff}</span>
      </div>
      <SelectionAmountLimit rule={selectionAmountLimit} />
      <div>
        <CheckBox.Group name={variationId}>
          {options.map(option => (
            <div className={`${option.disabled ? styles.unavailable : ''}`} key={option.id}>
              <CheckBox
                checked={option.selected}
                value={option.id}
                containerClassName={styles.variationOptionItem}
                className={styles.variationOptionOperator}
                data-test-id="ordering.menu.product-detail-drawer.check-box"
                disabled={option.disabled}
                onChange={onChange}
              >
                <div className={`${styles.variationOptionItemLabel}`}>
                  <div className={styles.variationOptionItemName}>{option.name}</div>
                  <div className={styles.variationOptionItemNote}>
                    {!option.available ? t('Unavailable') : option.formattedPriceDiff || null}
                  </div>
                </div>
              </CheckBox>
            </div>
          ))}
        </CheckBox.Group>
      </div>
    </section>
  );
};
SimpleMultipleChoiceVariation.displayName = 'SimpleMultipleChoiceVariation';
SimpleMultipleChoiceVariation.propTypes = { variation: VariationShape.isRequired };

export default SimpleMultipleChoiceVariation;
