import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Radio from '../../../../../common/components/Radio';
import Tag from '../../../../../common/components/Tag';
import { VariationShape } from './prop-types';
import SelectionAmountLimit from './SelectionAmountLimit';
import { selectVariationOption } from '../../redux/productDetail/thunks';
import styles from './ProductDetailDrawer.module.scss';

const SingleChoiceVariation = ({ variation }) => {
  const { id: variationId, name, formattedPriceDiff, selectedQuantity, options, selectionAmountLimit } = variation;
  const dispatch = useDispatch();
  const onChange = useCallback(
    e => {
      dispatch(selectVariationOption({ variationId, optionId: e.target.value }));
    },
    [dispatch, variationId]
  );
  const { t } = useTranslation();
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
        <Radio.Group name={variationId}>
          {options.map(option => (
            <div key={option.id} className={`${option.disabled ? styles.unavailable : ''}`}>
              <Radio
                checked={option.selected}
                value={option.id}
                containerClassName={styles.variationOptionItem}
                className={styles.variationOptionOperator}
                data-test-id="ordering.menu.product-detail-drawer.radio"
                disabled={option.disabled}
                onChange={onChange}
              >
                <div className={`${styles.variationOptionItemLabel}`}>
                  <div className={styles.variationOptionItemName}>{option.name}</div>
                  <div className={styles.variationOptionItemNote}>
                    {!option.available ? t('Unavailable') : option.formattedPriceDiff || null}
                  </div>
                </div>
              </Radio>
            </div>
          ))}
        </Radio.Group>
      </div>
    </section>
  );
};
SingleChoiceVariation.displayName = 'SingleChoiceVariation';
SingleChoiceVariation.propTypes = { variation: VariationShape.isRequired };

export default SingleChoiceVariation;
