import React from 'react';
import { useTranslation } from 'react-i18next';
import { selectionAmountLimit } from './prop-types';
import styles from './ProductDetailDrawer.module.scss';

const SelectionAmountLimit = props => {
  const {
    rule: { fulfilled, type, max, min },
  } = props;
  const { t } = useTranslation();
  if (!type) return null;
  return (
    <div className={`${styles.selectionAmountLimit} ${fulfilled ? styles.fulfilled : ''}`}>
      {type === 'SelectXOrMore'
        ? t('SelectXOrMore', { min })
        : type === 'SelectUpToX'
        ? t('SelectUpToX', { max })
        : type === 'SelectXToY'
        ? t('SelectXToY', { min, max })
        : type === 'SelectX'
        ? t('SelectX', { min })
        : ''}
    </div>
  );
};

SelectionAmountLimit.displayName = 'SelectionAmountLimit';

SelectionAmountLimit.propTypes = {
  rule: selectionAmountLimit,
};
SelectionAmountLimit.defaultProps = {
  rule: { visible: false },
};

export default SelectionAmountLimit;
