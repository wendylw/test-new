import React from 'react';
import PropTypes from 'prop-types';
import Radio from '../../../common/components/Radio';
import OptionSelectorStyles from './OptionSelector.module.scss';

const SingleChoiceSelector = ({ className, category, onClick }) => {
  const classNameList = [OptionSelectorStyles.OptionSelectorContainer, 'text-size-reset'];

  if (className) {
    classNameList.push(className);
  }

  return (
    <ul className={classNameList.join(' ')}>
      <Radio.Group name={category.id} data-heap-name="site.common.option-selector.radio-group-container">
        {category.options.map(option => (
          <Radio
            key={option.id}
            id={option.id}
            name={option.name}
            checked={option.selected}
            value={option.name}
            containerClassName={OptionSelectorStyles.OptionItemContainer}
            onChange={() => onClick(category, option)}
            data-heap-name="site.common.option-selector.radio-btn"
          >
            <span className={OptionSelectorStyles.OptionItemLabel}>{option.name}</span>
          </Radio>
        ))}
      </Radio.Group>
    </ul>
  );
};

SingleChoiceSelector.displayName = 'SingleChoiceSelector';

SingleChoiceSelector.propTypes = {
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
  onClick: PropTypes.func,
};

SingleChoiceSelector.defaultProps = {
  className: '',
  category: {},
  onClick: () => {},
};

export default SingleChoiceSelector;
