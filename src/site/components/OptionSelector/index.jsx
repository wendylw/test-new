import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import _get from 'lodash/get';
import Radio from '../../../common/components/Radio';
import Button from '../../../common/components/Button';
import CheckBox from '../../../common/components/CheckBox';
import styles from './OptionSelector.module.scss';

const OptionSelector = ({
  className,
  category,
  shouldUseRadioGroup,
  shouldUseCheckbox,
  onSingleChoiceClick,
  onResetButtonClick,
  onApplyButtonClick,
}) => {
  const { t } = useTranslation();
  const classNameList = [styles.OptionSelectorContainer, 'text-size-reset'];
  const [options, setOptions] = useState(_get(category, 'options', []));
  const shouldDisableFooterButton = useMemo(() => !options.some(option => option.selected), [options]);

  const handleClickMultipleChoice = useCallback(
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
        {shouldUseRadioGroup ? (
          <Radio.Group name={category.id} data-heap-name="site.common.option-selector.radio-group-container">
            {options.map(option => (
              <Radio
                key={option.id}
                id={option.id}
                name={option.name}
                checked={option.selected}
                value={option.name}
                containerClassName={styles.OptionItemContainer}
                onChange={() => onSingleChoiceClick(category, option)}
                data-heap-name="site.common.option-selector.radio-btn"
              >
                <span className={styles.OptionItemLabel}>{option.name}</span>
              </Radio>
            ))}
          </Radio.Group>
        ) : shouldUseCheckbox ? (
          <>
            <CheckBox.Group name={category.id} data-heap-name="site.common.option-selector.checkbox-group-container">
              {options.map(option => (
                <div key={option.id}>
                  <CheckBox
                    checked={option.selected}
                    value={option.id}
                    containerClassName={styles.OptionItemContainer}
                    className={styles.OptionItemCheckbox}
                    onChange={() => handleClickMultipleChoice(option.id)}
                    data-heap-name="site.common.option-selector.checkbox-btn"
                  >
                    <span className={styles.OptionItemLabel}>{option.name}</span>
                  </CheckBox>
                </div>
              ))}
            </CheckBox.Group>
          </>
        ) : null}
      </ul>
      {shouldUseCheckbox && (
        <div className={styles.OptionSelectorFooterContainer}>
          <Button
            className={styles.OptionSelectorFooterResetButton}
            type="text"
            disabled={shouldDisableFooterButton}
            onClick={() => onResetButtonClick(category)}
            data-heap-name="site.common.option-selector.reset-btn"
          >
            {t('Reset')}
          </Button>
          <Button
            className={styles.OptionSelectorFooterButton}
            type="primary"
            disabled={shouldDisableFooterButton}
            onClick={() => onApplyButtonClick(category, options)}
            data-heap-name="site.common.option-selector.apply-btn"
          >
            {t('Apply')}
          </Button>
        </div>
      )}
    </>
  );
};

OptionSelector.displayName = 'OptionSelector';

OptionSelector.propTypes = {
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
  shouldUseRadioGroup: PropTypes.bool,
  shouldUseCheckbox: PropTypes.bool,
  onSingleChoiceClick: PropTypes.func,
  onResetButtonClick: PropTypes.func,
  onApplyButtonClick: PropTypes.func,
};

OptionSelector.defaultProps = {
  className: '',
  category: {},
  shouldUseRadioGroup: false,
  shouldUseCheckbox: false,
  onSingleChoiceClick: () => {},
  onResetButtonClick: () => {},
  onApplyButtonClick: () => {},
};

export default OptionSelector;
