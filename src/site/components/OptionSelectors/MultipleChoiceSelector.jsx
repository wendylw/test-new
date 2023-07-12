import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import _get from 'lodash/get';
import Button from '../../../common/components/Button';
import CheckBox from '../../../common/components/CheckBox';
import OptionSelectorStyles from './OptionSelector.module.scss';
import styles from './MultipleChoiceSelector.module.scss';

const MultipleChoiceSelector = ({ className, category, onResetButtonClick, onApplyButtonClick }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState(_get(category, 'options', []));
  const shouldDisableFooterButton = useMemo(() => !options.some(option => option.selected), [options]);
  const classNameList = [OptionSelectorStyles.OptionSelectorContainer, 'text-size-reset'];

  const handleClickChoice = useCallback(
    id => {
      const newOptions = options.map(option => {
        if (option.id === id) {
          return { ...option, selected: !option.selected };
        }
        return option;
      });
      setOptions(newOptions);
    },
    [options]
  );

  if (className) {
    classNameList.push(className);
  }

  return (
    <>
      <ul className={classNameList.join(' ')}>
        <CheckBox.Group name={category.id} data-heap-name="site.common.option-selector.checkbox-group-container">
          {options.map(option => (
            <div key={option.id}>
              <CheckBox
                checked={option.selected}
                value={option.id}
                containerClassName={OptionSelectorStyles.OptionItemContainer}
                className={styles.MultipleChoiceSelectorCheckbox}
                onChange={() => handleClickChoice(option.id)}
                data-heap-name="site.common.option-selector.checkbox-btn"
              >
                <span className={OptionSelectorStyles.OptionItemLabel}>{option.name}</span>
              </CheckBox>
            </div>
          ))}
        </CheckBox.Group>
      </ul>
      <div className={styles.MultipleChoiceSelectorFooterContainer}>
        <Button
          block
          type="text"
          theme="ghost"
          className={styles.MultipleChoiceSelectorFooterResetButton}
          contentClassName={styles.MultipleChoiceSelectorFooterResetButtonContent}
          disabled={shouldDisableFooterButton}
          onClick={() => onResetButtonClick(category)}
          data-heap-name="site.common.option-selector.reset-btn"
        >
          {t('Reset')}
        </Button>
        <Button
          block
          type="primary"
          contentClassName={styles.MultipleChoiceSelectorFooterButton}
          disabled={shouldDisableFooterButton}
          onClick={() => onApplyButtonClick(category, options)}
          data-heap-name="site.common.option-selector.apply-btn"
        >
          {t('Apply')}
        </Button>
      </div>
    </>
  );
};

MultipleChoiceSelector.displayName = 'MultipleChoiceSelector';

MultipleChoiceSelector.propTypes = {
  className: PropTypes.string,
  category: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      })
    ),
  }),
  onResetButtonClick: PropTypes.func,
  onApplyButtonClick: PropTypes.func,
};

MultipleChoiceSelector.defaultProps = {
  className: '',
  category: {},
  onResetButtonClick: () => {},
  onApplyButtonClick: () => {},
};

export default MultipleChoiceSelector;
